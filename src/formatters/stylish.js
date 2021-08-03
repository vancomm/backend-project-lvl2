import _ from 'lodash';
import { getStatus } from '../utilities.js';

const pref = (level, sign = '', spaces = 4) => (sign === ''
  ? ' '.repeat(spaces * level)
  : ' '.repeat(spaces * (level - 1)).concat(`  ${sign} `)
);

const addData = (key, value, level, sign, recursiveCall) => {
  if (_.isObject(value)) { //                           version is an object
    return [`${pref(level, sign)}${key}: {`, recursiveCall(value, level + 1), `${pref(level)}}`];
  } //                                                  version is plain data
  return [`${pref(level, sign)}${key}: ${value}`];
};

const addDataWithVersions = (key, value, level, recursiveCall, status) => {
  const { oldValue, newValue } = value;
  if (status === 2) { //                   member has two identical versions
    return addData(key, oldValue, level, '', recursiveCall).flat();
  }
  if (status === 1) {
    return [addData(key, oldValue, level, '-', recursiveCall).flat(), addData(key, newValue, level, '+', recursiveCall).flat()].flat();
  }
  if (status === 0) { //  member has an old version
    return addData(key, oldValue, level, '-', recursiveCall).flat();
  }
  if (status === 3) { //  member has a new version
    return addData(key, newValue, level, '+', recursiveCall).flat();
  }
  return [];
};

const iter = (object, level) => {
  const members = _.orderBy(_.entries(object), (a) => a[0]);
  const result = members.map(([key, value]) => {
    const status = getStatus(value);
    if (status === -1) { //                           member doesn't have versions
      return addData(key, value, level, '', iter).flat();
    } //                                              member has versions
    return addDataWithVersions(key, value, level, iter, status);
  });
  return result.flat();
};

const stylish = (data) => {
  const result = iter(data, 1);
  return ['{', ...result, '}'].join('\n');
};

export default stylish;
