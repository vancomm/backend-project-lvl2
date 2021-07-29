import _ from 'lodash';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const normalizePath = (file) => path.resolve(process.cwd(), file);

const containsKey = (obj, key) => obj[key] ?? false;

const diffJSON = (data1, data2) => {
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
    const value1 = a.slice(4).split(':')[0];
    const value2 = b.slice(4).split(':')[0];
    if (value1 === value2) return sign1 === '+' ? 1 : -1;
    return value1 > value2 ? 1 : -1;
  });
  return ['{', ...result, '}'].join('\n');
};

const diff = (filename1, filename2) => {
  const [path1, path2] = [filename1, filename2].map(normalizePath);

  if (!existsSync(path1) || !existsSync(path2)) {
    return 'Can\'t find files';
  }

  const [ext1, ext2] = [path1, path2].map((item) => _.toLower(item.split('.').pop()));

  if (ext1.valueOf() !== ext2.valueOf()) {
    return 'Can\'t compare different file extensions';
  }

  const file1 = readFileSync(path1, 'utf-8');
  const file2 = readFileSync(path2, 'utf-8');

  if (ext1 === 'json') {
    const [data1, data2] = [file1, file2].map(JSON.parse);
    return diffJSON(data1, data2);
  }

  return '';
};

export {
  normalizePath,
  containsKey,
};

export default diff;
