// import _ from 'lodash';
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
  const result = [];
  Object.entries(data1).forEach(([key, value]) => {
    if (containsKey(data2, key)) {
      if (value === data2[key]) result.push(`    ${key}: ${value}`);
      else {
        result.push(`  - ${key}: ${value}`);
        result.push(`  + ${key}: ${data2[key]}`);
      }
    } else result.push(`  - ${key}: ${value}`);
  });
  Object.entries(data2).forEach(([key, value]) => {
    if (!containsKey(data1, key)) {
      result.push(`  + ${key}: ${value}`);
    }
  });
  result.sort((a, b) => {
    const sign1 = a.slice(0, 4).trim();
    const [key1, key2] = [a, b].map((item) => item.slice(4).split(':')[0]);
    if (key1 === key2) return sign1 === '+' ? 1 : -1;
    return key1 > key2 ? 1 : -1;
  });
  return ['{', ...result, '}'].join('\n');
};

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
  return buildResult(data1, data2);
};

export default diff;
