import _ from 'lodash';
import { containsKey } from './utilities.js';

const makeNode = (oldValue, newValue) => ({ oldValue, newValue });

const iter1 = (object, source, res) => {
  _.entries(object).forEach(([key, value]) => {
    if (containsKey(source, key)) { //                    there is a new version of member
      if (_.isObject(value) && _.isObject(source[key])) { //  member is an object in both versions
        res[key] = {};
        iter1(value, source[key], res[key]);
      } else { //                                             member is something else
        res[key] = makeNode(value, source[key]);
      }
    } else { //                                           there is no new version of member
      res[key] = makeNode(value);
    }
  });
};

const iter2 = (source, object, res) => {
  _.entries(source).forEach(([key, value]) => {
    if (containsKey(object, key)) { //              there is an old version of member
      if (_.isObject(value)) { //                       new version is an object
        iter2(value, object[key], res[key]);
      } else { //                                       new version is not an object
        res[key].newValue = value;
      }
    } else { //                                     there is no old version of member
      res[key] = makeNode(undefined, value);
    }
  });
};

const buildResult = (data1, data2) => {
  const result = {};
  iter1(data1, data2, result);
  iter2(data2, data1, result);
  return result;
};

export default buildResult;
