import _ from 'lodash';

const getKey = (node) => node.key;

/**
 * Get type of an object
 *
 * @param {Object} node Object to get type of
 * @returns {"node"|"leaf"} Type of an object
 */
const getType = (node) => node.type;

const getChildren = (node) => node.children;

/**
 * Get status of an object
 *
 * @param {Object} node Object to get status of
 * @returns {("added"|"unchanged"|"updated"|"removed")} Status of an object
 */
const getStatus = (node) => node.status;

/**
 * Get values of an object
 *
 * @param {Object} node Object to get values of
 * @returns {{oldValue, newValue}} Values of object
 */
const getValues = (node) => {
  const { oldValue, newValue } = node;
  return { oldValue, newValue };
};

const makeLeafNode = (key, oldValue, newValue, type = 'leaf') => {
  const makeStatus = (a, b) => {
    const hasOld = typeof a !== 'undefined';
    const hasNew = typeof b !== 'undefined';
    if (!hasOld && !hasNew) throw new Error('makeStatus() was passed bad values!');
    if (hasOld && hasNew) {
      return a === b ? 'unchanged' : 'updated';
    }
    return hasOld ? 'removed' : 'added';
  };

  return {
    key,
    oldValue,
    newValue,
    type,
    status: makeStatus(oldValue, newValue),
  };
};

const makeNode = (key, children, type = 'node') => ({
  key, children, type,
});

const makeTree = (object, source) => {
  const left = _.entries(object);
  const right = _.entries(source);

  const onlyLeft = left
    .filter(([key]) => right.every(([name]) => name !== key))
    .map(([key, value]) => makeLeafNode(key, value));

  const intersect = left
    .filter(([key]) => right.some(([name]) => name === key))
    .map(([key, value]) => {
      if (_.isObject(value) && _.isObject(source[key])) {
        const children = makeTree(object[key], source[key]);
        return makeNode(key, children);
      }
      return makeLeafNode(key, object[key], source[key]);
    });

  const onlyRight = right
    .filter(([key]) => left.every(([name]) => name !== key))
    .map(([key, value]) => makeLeafNode(key, undefined, value));

  return [...onlyLeft, ...intersect, ...onlyRight];
};

export default makeTree;

export {
  getKey,
  getType,
  getChildren,
  getStatus,
  getValues,
};
