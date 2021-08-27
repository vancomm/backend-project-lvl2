import debug from './debug.js';
import stylish from './stylish.js';
import plain from './plain.js';
import json from './json.js';

const getFormatter = (option) => {
  switch (option) {
    case 'debug':
      return debug;
    case 'stylisg':
      return stylish;
    case 'plain':
      return plain;
    case 'json':
      return json;
    default:
      return stylish;
  }
};

export default getFormatter;
