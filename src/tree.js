import _ from 'lodash';

const getKey = (obj) => obj.key;

/**
 * Get type of an object
 *
 * @param {Object} obj Object to get type of
 * @returns {"node"|"leaf"} Type of an object
 */
const getType = (obj) => obj.type;

const getChildren = (obj) => obj.children;

/**
 * Get status of an object
 *
 * @param {Object} obj Object to get status of
 * @returns {("added"|"unchanged"|"updated"|"removed"|"bug")} Status of an object
 */
const getStatus = (obj) => obj.status;

/**
 * Get values of an object
 *
 * @param {Object} obj Object to get values of
 * @returns {{oldValue, newValue}} Values of object
 */
const getValues = (obj) => {
  const { oldValue, newValue } = obj;
  return { oldValue, newValue };
};

const makeLeaf = (key, oldValue, newValue, type = 'leaf') => {
  const makeStatus = (a, b) => {
    const hasOld = typeof a !== 'undefined';
    const hasNew = typeof b !== 'undefined';
    if (!hasOld && !hasNew) return 'bug';
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
    get status() { return makeStatus(this.oldValue, this.newValue); },
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
    .map(([key, value]) => makeLeaf(key, value));

  const intersect = left
    .filter(([key]) => right.some(([name]) => name === key))
    .map(([key, value]) => {
      if (_.isObject(value) && _.isObject(source[key])) {
        const children = makeTree(object[key], source[key]);
        return makeNode(key, children);
      }
      return makeLeaf(key, object[key], source[key]);
    });

  const onlyRight = right
    .filter(([key]) => left.every(([name]) => name !== key))
    .map(([key, value]) => makeLeaf(key, undefined, value));

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
