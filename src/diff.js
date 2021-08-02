import _ from 'lodash';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fromJSON, fromYAML } from './parsers.js';

const normalizePath = (file) => path.resolve(process.cwd(), file);

const getParseFunction = (ext) => {
  if (ext === '.json') {
    return fromJSON;
  }
  if (ext === '.yaml' || ext === '.yml') {
    return fromYAML;
  }
  return fromJSON;
};

const buildResult = (data1, data2) => {
  const containsKey = (obj, key) => obj[key] ?? false;
  const makeNode = (oldValue, newValue = null) => ({ oldValue, newValue });

  const iter1 = (subj, ref, res) => {
    const members = _.entries(subj);
    members.forEach(([key, value]) => {
      if (containsKey(ref, key)) {
        if (_.isObject(value)) {
          res[key] = {};
          iter1(subj[key], ref[key], res[key]);
        } else {
          res[key] = makeNode(value, ref[key]);
        }
      } else {
        res[key] = makeNode(value);
      }
    });
  };

  const iter2 = (subj, ref, res) => {
    const members = _.entries(subj);
    members.forEach(([key, value]) => {
      if (containsKey(ref, key)) {
        if (_.isObject(value)) {
          iter2(subj[key], ref[key], res[key]);
        }
      } else {
        res[key] = makeNode(null, value);
      }
    });
  };

  const result = {};
  iter1(data1, data2, result);
  iter2(data2, data1, result);
  return result;
};

const formatResult = (result) => JSON.stringify(result, null, '  ').replace(/"/g, '');

const diff = (filename1, filename2) => {
  const [path1, path2] = [filename1, filename2].map(normalizePath);
  if (!existsSync(path1) || !existsSync(path2)) {
    return 'Can\'t find files';
  }
  const [file1, file2] = [path1, path2].map((item) => readFileSync(item, 'utf-8'));

  const [ext1, ext2] = [path1, path2].map(path.extname);
  if (ext1.valueOf() !== ext2.valueOf()) {
    return 'Can\'t compare files with different extensions';
  }
  const parse = getParseFunction(ext1);

  const [data1, data2] = [file1, file2].map(parse);
  const result = buildResult(data1, data2);

  const formatted = formatResult(result);
  return formatted;
};

export default diff;
