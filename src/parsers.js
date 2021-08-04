import yaml from 'js-yaml';

const fromJSON = (file) => JSON.parse(file);

const fromYAML = (file) => yaml.load(file);

const getParser = (ext) => {
  if (ext === '.json') {
    return fromJSON;
  }
  if (ext === '.yaml' || ext === '.yml') {
    return fromYAML;
  }
  return fromJSON;
};

export default getParser;
