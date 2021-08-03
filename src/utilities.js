/* eslint-disable import/prefer-default-export */
const containsKey = (obj, key) => (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'undefined');

/**
 * Returns status of value's versions.
 *
 *  Statuses:
 *  -1: no versions,
 *  0:  only old      (removed),
 *  1:  old and new   (updated),
 *  2:  same versions (unchanged),
 *  3:  only new      (added).
 *
 *  @param {object} value Value to get status of.
 *  @return {number} Status of the value.
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

const memberSorter = (a, b) => (a[0] > b[0] ? 1 : -1);

export {
  containsKey,
  getStatus,
  memberSorter,
};
