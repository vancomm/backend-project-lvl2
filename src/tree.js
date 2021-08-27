import _ from 'lodash';

const getKey = (node) => node.key;

/**
 * Get type of an node
 *
 * @param {Object} node Node to get type of
 * @returns {"internal"|"leaf"} Type of an node
 */
const getType = (node) => node.type;

const getChildren = (node) => node.children;

/**
 * Get values of a node
 *
 * @param {Object} node Node to get values of
 * @returns {{oldValue, newValue}} Values of node
 */
const getValues = (node) => {
  const { oldValue, newValue } = node;
  return { oldValue, newValue };
};

/**
 * Get status of a node
 *
 * @param {Object} node Node to get status of
 * @returns {("added"|"unchanged"|"updated"|"removed")} Status of a node
 */
const getStatus = (node) => node.status;

const makeStatus = (older, newer) => {
  const hasOld = typeof older !== 'undefined';
  const hasNew = typeof newer !== 'undefined';
  if (!hasOld && !hasNew) throw new Error('makeStatus() was passed bad values!');
  if (!hasOld) return 'added';
  if (!hasNew) return 'removed';
  return older === newer
    ? 'unchanged'
    : 'updated';
};

const makeLeafNode = (key, oldValue, newValue, type = 'leaf') => ({
  key,
  oldValue,
  newValue,
  type,
  status: makeStatus(oldValue, newValue),
});

const makeInternalNode = (key, children, type = 'internal') => ({
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
        return makeInternalNode(key, children);
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
