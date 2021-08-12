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

const buildLine = (path, values, status) => {
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

const iter = (path, data) => {
  const result = _.orderBy(data, ({ key }) => key)
    .map((object) => {
      const key = getKey(object);
      const type = getType(object);
      const newPath = [...path, key];
      if (type === 'node') {
        const children = getChildren(object);
        return iter(newPath, children);
      }
      if (type === 'leaf') {
        const values = getValues(object);
        const status = getStatus(object);
        return buildLine(newPath, values, status);
      }
      return [];
    });
  return result.flat();
};

const plain = (data) => {
  const result = iter([], data);
  return result.join('\n');
};

export default plain;
