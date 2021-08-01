import yaml from 'js-yaml';

const fromJSON = (file) => JSON.parse(file);

const fromYAML = (file) => yaml.load(file);

export {
  fromJSON,
  fromYAML,
};
