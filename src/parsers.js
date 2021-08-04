import yaml from 'js-yaml';

const fromJSON = (content) => JSON.parse(content);

const fromYAML = (content) => yaml.load(content);

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
