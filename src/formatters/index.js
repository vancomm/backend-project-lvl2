import debug from './debug.js';
import stylish from './stylish.js';
import plain from './plain.js';
import json from './json.js';

const getFormatter = (option) => {
  if (option === 'debug') return debug;
  if (option === 'stylish') return stylish;
  if (option === 'plain') return plain;
  if (option === 'json') return json;
  return stylish;
};

export default getFormatter;
