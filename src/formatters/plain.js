import _ from 'lodash';
import { getStatus, memberSorter } from '../utilities.js';

const normalizeValue = (value) => {
  if (typeof value === 'undefined') return '';
  if (_.isObject(value)) return '[complex value]';
  if (_.isString(value)) return `'${value}'`;
  return value;
};

const buildLine = (path, value, status) => {
  const pathString = path.join('.');
  const { oldValue, newValue } = value;
  const [oldString, newString] = [oldValue, newValue].map(normalizeValue);
  if (status === 0) { //  removed
    return `Property '${pathString}' was removed`;
  }
  if (status === 1) { //  updated
    return `Property '${pathString}' was updated. From ${oldString} to ${newString}`;
  }
  if (status === 3) { //  added
    return `Property '${pathString}' was added with value: ${newString}`;
  }
  return 'buildLine was called with bad arguments!';
};

const iter = (path, data) => {
  const result = [];
  const members = _.orderBy(_.entries(data), (a) => a[0]);
  members.sort(memberSorter);
  members.forEach(([key, value]) => {
    const status = getStatus(value);
    const newPath = _.clone(path);
    newPath.push(key);
    if (status !== -1 && status !== 2) {
      result.push(buildLine(newPath, value, status));
    } else if (status === -1) {
      result.push(iter(newPath, value));
    }
  });
  return result.flat();
};

const plain = (data) => {
  const result = iter([], data);
  return result.join('\n');
};

export default plain;