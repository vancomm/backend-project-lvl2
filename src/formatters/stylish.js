import _ from 'lodash';
import { containsKey } from '../utilities.js';

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

/**
 * Returns status of value's versions.
 *
 *  Statuses:
 *  -1: no versions,
 *  0:  only old      (deleted),
 *  1:  old and new   (updated),
 *  2:  same versions (unchanged),
 *  3:  only new      (added).
 *
 * @param {object} value Value to get status of.
 * @return {number} Status of the value.
 */
const getStatus = (value) => {
  const hasOld = containsKey(value, 'oldValue');
  const hasNew = containsKey(value, 'newValue');

  if (hasOld && !hasNew) return 0;
  if (hasOld && hasNew) {
    const { oldValue, newValue } = value;
    return (oldValue === newValue) ? 2 : 1;
  }
  if (!hasOld && hasNew) return 3;
  return -1;
};

const addDataWithVersions = (key, value, res, level, recursiveCall, status) => {
  const { oldValue, newValue } = value;
  if (status === 2) { //                   member has two identical versions
    addData(key, oldValue, res, level, '', recursiveCall);
  }
  if (status === 0 || status === 1) { //  member has an old version
    addData(key, oldValue, res, level, '-', recursiveCall);
  }
  if (status === 3 || status === 1) { //  member has a new version
    addData(key, newValue, res, level, '+', recursiveCall);
  }
};

const iter = (object, res, level) => {
  const members = _.entries(object);
  members.sort((a, b) => (a[0] > b[0] ? 1 : -1));
  members.forEach(([key, value]) => {
    const status = getStatus(value);
    if (status === -1) { //                          member doesn't have versions
      addData(key, value, res, level, '', iter);
    } else { //                                       member has versions
      addDataWithVersions(key, value, res, level, iter, status);
    }
  });
};

const stylish = (data) => {
  const result = [];
  iter(data, result, 1);
  return ['{', ...result, '}'].join('\n');
};

export default stylish;
