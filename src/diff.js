import _ from 'lodash';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fromJSON, fromYAML } from './parsers.js';
import { debug, stylish } from './formatters.js';
import { containsKey } from './utilities.js';

const normalizePath = (file) => path.resolve(process.cwd(), file);

const getParser = (ext) => {
  if (ext === '.json') {
    return fromJSON;
  }
  if (ext === '.yaml' || ext === '.yml') {
    return fromYAML;
  }
  return fromJSON;
};

const buildResult = (data1, data2) => {
  const makeNode = (oldValue, newValue) => ({ oldValue, newValue });
  const iter1 = (object, source, res) => {
    _.entries(object).forEach(([key, value]) => {
      if (containsKey(source, key)) { //              there is a new version of member
        if (_.isObject(value) && _.isObject(source[key])) {
          //                                              member is an object in both versions
          res[key] = {};
          iter1(value, source[key], res[key]);
        } else { //                                       member is plain data
          res[key] = makeNode(value, source[key]);
        }
      } else { //                                     there is no new version of member
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
  const result = {};
  iter1(data1, data2, result);
  iter2(data2, data1, result);
  return result;
};

const getFormatter = (option) => {
  if (option === 'debug') return debug;
  if (option === 'stylish') return stylish;
  return debug;
};

const diff = (filename1, filename2, formatterOption = 'stylish') => {
  const [path1, path2] = [filename1, filename2].map(normalizePath);
  if (!existsSync(path1) || !existsSync(path2)) {
    return 'Can\'t find files';
  }
  const [file1, file2] = [path1, path2].map((item) => readFileSync(item, 'utf-8'));

  const [ext1, ext2] = [path1, path2].map(path.extname);
  if (ext1.valueOf() !== ext2.valueOf()) {
    return 'Can\'t compare files with different extensions';
  }
  const parse = getParser(ext1);

  const [data1, data2] = [file1, file2].map(parse);
  const result = buildResult(data1, data2);

  const formatResult = getFormatter(formatterOption);
  const formatted = formatResult(result);
  return formatted;
};

export default diff;
