import debug from './debug.js';
import stylish from './stylish.js';
import plain from './plain.js';

const getFormatter = (option) => {
  if (option === 'debug') return debug;
  if (option === 'stylish') return stylish;
  if (option === 'plain') return plain;
  return stylish;
};

export default getFormatter;
