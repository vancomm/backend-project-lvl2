import _ from 'lodash';
import {
  getKey, getType, getChildren, getStatus, getValues,
} from '../tree.js';

const pref = (level, sign = '', spaces = 4) => (sign === ''
  ? ' '.repeat(spaces * level)
  : ' '.repeat(spaces * (level - 1)).concat(`  ${sign} `)
);

const makeLine = (level, key, sign, value) => {
  const hasKey = typeof key !== 'undefined';
  const hasValue = typeof value !== 'undefined';
  if (hasKey) {
    if (hasValue) {
      return `${pref(level, sign)}${key}: ${value}`;
    }
    return `${pref(level, sign)}${key}: {`;
  }
  return `${pref(level, sign)}}`;
};

const makeObjectArray = (object, level) => {
  const members = _.entries(object);
  const result = _.orderBy(members, (a) => a[0])
    .map(([key, value]) => {
      if (_.isObject(value)) {
        return [
          makeLine(level, key),
          ...makeObjectArray(value, level + 1),
          makeLine(level),
        ];
      }
      return [makeLine(level, key, '', value)];
    });
  return result.flat();
};

/**
 * Build an array of text describing property
 *
 * @param {string} key Name of described property
 * @param {string} value Value of described property
 * @param {number} level Level of depth of described property
 * @param {"+"|"-"} [sign] Plus or minus depending on property's status
 * @returns {Array} Property description array
 */
const makeEntryArray = (key, value, level, sign) => {
  if (_.isObject(value)) {
    return [
      makeLine(level, key, sign),
      ...makeObjectArray(value, level + 1),
      makeLine(level),
    ];
  }
  return [makeLine(level, key, sign, value)];
};

const buildEntry = (key, values, status, level) => {
  const { oldValue, newValue } = values;
  switch (status) {
    case 'removed':
      return makeEntryArray(key, oldValue, level, '-').flat();
    case 'unchanged':
      return makeEntryArray(key, oldValue, level).flat();
    case 'updated':
      return [
        ...makeEntryArray(key, oldValue, level, '-'),
        ...makeEntryArray(key, newValue, level, '+'),
      ];
    case 'added':
      return makeEntryArray(key, newValue, level, '+').flat();
    default:
      return [];
  }
};

const iter = (data, level) => {
  const result = _.orderBy(data, ({ key }) => key)
    .map((object) => {
      const key = getKey(object);
      const type = getType(object);
      if (type === 'node') {
        const children = getChildren(object);
        return [
          makeLine(level, key),
          iter(children, level + 1).flat(),
          makeLine(level),
        ];
      }
      if (type === 'leaf') {
        const values = getValues(object);
        const status = getStatus(object);
        return buildEntry(key, values, status, level);
      }
      return [];
    });
  return result.flat();
};

const stylish = (data) => {
  const result = iter(data, 1).flat();
  return ['{', ...result, '}'].join('\n');
};

export default stylish;
