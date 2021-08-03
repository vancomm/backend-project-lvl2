/* eslint-disable import/prefer-default-export */
const containsKey = (obj, key) => (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'undefined');

export {
  containsKey,
};
