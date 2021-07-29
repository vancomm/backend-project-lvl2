// import _ from 'lodash';
import { readFileSync } from 'fs';
import path from 'path';

// const basepath = process.cwd();

const normalizePath = (file) => path.resolve(process.cwd(), file);

const containsKey = (obj, key) => obj[key] ?? false;

const diff = (filename1, filename2) => {
  const result = [];

  const callback1 = (key, value, first, second) => {
    if (containsKey(second, key)) {
      if (value === second[key]) {
        result.push(`    ${key}: ${value}`);
      } else {
        result.push(`  - ${key}: ${value}`);
        result.push(`  + ${key}: ${second[key]}`);
      }
    } else {
      result.push(`  - ${key}: ${value}`);
    }
  };

  const callback2 = (key, value, first) => {
    if (!containsKey(first, key)) {
      result.push(`  + ${key}: ${value}`);
    }
  };

  const sorter = (a, b) => {
    const sign1 = a.slice(0, 4).trim();
    // const sign2 = b.slice(0, 4).trim();
    const value1 = a.slice(4).split(':')[0];
    const value2 = b.slice(4).split(':')[0];
    if (value1 === value2) return sign1 === '+' ? 1 : -1;
    return value1 > value2 ? 1 : -1;
  };

  const [path1, path2] = [filename1, filename2].map(normalizePath);

  const file1 = readFileSync(path1, 'utf-8');
  const file2 = readFileSync(path2, 'utf-8');

  const [data1, data2] = [file1, file2].map(JSON.parse);

  Object.entries(data1).forEach(([key, value]) => callback1(key, value, data1, data2));
  Object.entries(data2).forEach(([key, value]) => callback2(key, value, data1));

  result.sort(sorter);
  result.unshift('{');
  result.push('}');

  return result.join('\n');
};

export {
  normalizePath,
  containsKey,
};

export default diff;
