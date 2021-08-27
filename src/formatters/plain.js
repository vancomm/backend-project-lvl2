import _ from 'lodash';
import {
  getKey, getType, getChildren, getStatus, getValues,
} from '../tree.js';

const normalizeValue = (value) => {
  if (typeof value === 'undefined') return '';
  if (_.isObject(value)) return '[complex value]';
  if (_.isString(value)) return `'${value}'`;
  return value;
};

const makeLine = (path, values, status) => {
  const pathString = path.join('.');
  const { oldValue, newValue } = values;
  const [oldString, newString] = [oldValue, newValue].map(normalizeValue);
  if (status === 'removed') {
    return `Property '${pathString}' was removed`;
  }
  if (status === 'updated') {
    return `Property '${pathString}' was updated. From ${oldString} to ${newString}`;
  }
  if (status === 'added') {
    return `Property '${pathString}' was added with value: ${newString}`;
  }
  return [];
};

const makeLinesFromInternal = (path, data) => {
  const result = _.orderBy(data, 'key')
    .map((object) => {
      const key = getKey(object);
      const type = getType(object);
      const newPath = [...path, key];
      if (type === 'internal') {
        const children = getChildren(object);
        return makeLinesFromInternal(newPath, children);
      }
      if (type === 'leaf') {
        const values = getValues(object);
        const status = getStatus(object);
        return makeLine(newPath, values, status);
      }
      return [];
    });
  return result.flat();
};

const plain = (data) => {
  const result = makeLinesFromInternal([], data);
  return result.join('\n');
};

export default plain;
