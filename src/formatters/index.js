import stylish from './stylish.js';
import debug from './debug.js';

const getFormatter = (option) => {
  if (option === 'debug') return debug;
  if (option === 'stylish') return stylish;
  return debug;
};

export default getFormatter;
