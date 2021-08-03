import _ from 'lodash';
import { containsKey } from './utilities.js';

/**
 * Returns info on what versions value has.
 *
 *  Version numbers:
 *  -1: no versions,
 *  0:  only old      (deleted),
 *  1:  old and new   (updated),
 *  2:  only new      (added).
 *
 * @param {object} value Value to get versions of.
 * @return {number} Info on versions of the value.
*/
const getVersion = (value) => {
  const hasOld = containsKey(value, 'oldValue');
  const hasNew = containsKey(value, 'newValue');

  if (hasOld && !hasNew) return 0;
  if (hasOld && hasNew) return 1;
  if (!hasOld && hasNew) return 2;
  return -1;
};

const debug = (data) => JSON.stringify(data, null, '  ').replace(/"/g, '');

const stylish = (data) => {
  const pref = (level, sign = '', spaces = 4) => (sign === ''
    ? ' '.repeat(spaces * level)
    : ' '.repeat(spaces * (level - 1)).concat(`  ${sign} `)
  );
  const addData = (key, value, res, level, sign, recursiveCall) => {
    if (_.isObject(value)) { //                           version is an object
      res.push(`${pref(level, sign)}${key}: {`);
      recursiveCall(value, res, level + 1);
      res.push(`${pref(level)}}`);
    } else { //                                           version is plain data
      res.push(`${pref(level, sign)}${key}: ${value}`);
    }
  };
  const addDataWithVersions = (key, value, res, level, recursiveCall, version) => {
    if (version === 1) { //                           member has two versions
      const { oldValue, newValue } = value;
      if (oldValue === newValue) { //                     two versions are the same
        addData(key, oldValue, res, level, '', recursiveCall);
      } else { //                                         two versions are different
        addData(key, oldValue, res, level, '-', recursiveCall);
        addData(key, newValue, res, level, '+', recursiveCall);
      }
    } else if (version === 0) { //                    member only has an old version
      const { oldValue } = value;
      addData(key, oldValue, res, level, '-', recursiveCall);
    } else if (version === 2) { //                    member only has a new version
      const { newValue } = value;
      addData(key, newValue, res, level, '+', recursiveCall);
    }
  };
  const iter = (object, res, level) => {
    const members = _.entries(object);
    members.sort((a, b) => (a[0] > b[0] ? 1 : -1));
    members.forEach(([key, value]) => {
      const version = getVersion(value);
      if (version === -1) { //                          member doesn't have versions
        addData(key, value, res, level, '', iter);
      } else { //                                       member has versions
        addDataWithVersions(key, value, res, level, iter, version);
      }
    });
  };
  const result = [];
  iter(data, result, 1);
  return ['{', ...result, '}'].join('\n');
};

export {
  debug,
  stylish,
};
