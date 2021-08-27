import _ from 'lodash';
import {
  getKey, getType, getChildren, getStatus, getValues,
} from '../tree.js';

const makePref = (depth, sign = '', spaces = 4) => (sign === ''
  ? ' '.repeat(spaces * depth)
  : ' '.repeat(spaces * (depth - 1)).concat(`  ${sign} `)
);

/**
 * Make a line of text describing property
 *
 * @param {string} key Name of described property
 * @param {string} value Value of described property
 * @param {number} depth Level of depth of described property
 * @param {"+"|"-"} [sign] Plus or minus depending on property's status
 * @returns {String} Text desribing property
 */
const makeLine = (depth, key, sign, value) => {
  const hasKey = typeof key !== 'undefined';
  const hasValue = typeof value !== 'undefined';
  if (hasKey) {
    if (hasValue) {
      return `${makePref(depth, sign)}${key}: ${value}`;
    }
    return `${makePref(depth, sign)}${key}: {`;
  }
  return `${makePref(depth, sign)}}`;
};

const makeLinesFromObject = (object, level) => {
  const members = _.entries(object);
  const result = _.orderBy(members, (a) => a[0])
    .map(([key, value]) => {
      if (_.isObject(value)) {
        return [
          makeLine(level, key),
          ...makeLinesFromObject(value, level + 1),
          makeLine(level),
        ];
      }
      return [makeLine(level, key, '', value)];
    });
  return result.flat();
};

/**
 * Make an array of text describing property
 *
 * @param {string} key Name of described property
 * @param {string} value Value of described property
 * @param {number} level Level of depth of described property
 * @param {"+"|"-"} [sign] Plus or minus depending on property's status
 * @returns {Array} Array of lines describing property
 */
const makeLineArray = (key, value, level, sign) => {
  if (_.isObject(value)) {
    return [
      makeLine(level, key, sign),
      ...makeLinesFromObject(value, level + 1),
      makeLine(level),
    ];
  }
  return [makeLine(level, key, sign, value)];
};

const makeLinesFromLeaf = (key, values, status, level) => {
  const { oldValue, newValue } = values;
  switch (status) {
    case 'removed':
      return makeLineArray(key, oldValue, level, '-').flat();
    case 'unchanged':
      return makeLineArray(key, oldValue, level).flat();
    case 'updated':
      return [
        ...makeLineArray(key, oldValue, level, '-'),
        ...makeLineArray(key, newValue, level, '+'),
      ];
    case 'added':
      return makeLineArray(key, newValue, level, '+').flat();
    default:
      return [];
  }
};

const makeLinesFromInternal = (data, depth) => {
  const result = _.orderBy(data, 'key')
    .map((object) => {
      const key = getKey(object);
      const type = getType(object);
      if (type === 'internal') {
        const children = getChildren(object);
        return [
          makeLine(depth, key),
          makeLinesFromInternal(children, depth + 1).flat(),
          makeLine(depth),
        ];
      }
      if (type === 'leaf') {
        const values = getValues(object);
        const status = getStatus(object);
        return makeLinesFromLeaf(key, values, status, depth);
      }
      return [];
    });
  return result.flat();
};

const stylish = (rootNode) => {
  const result = makeLinesFromInternal(rootNode, 1).flat();
  return ['{', ...result, '}'].join('\n');
};

export default stylish;
