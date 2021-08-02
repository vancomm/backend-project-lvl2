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

// const buildResult = (data1, data2) => {
//   const makeNode = (oldValue, newValue) => ({ oldValue, newValue });

//   const clone = (source, makeNodeFunction) => _.entries(source).reduce((acc, [key, value]) => {
//     if (_.isObject(value)) acc[key] = makeNodeFunction(clone(value, makeNodeFunction));
//     else acc[key] = makeNodeFunction(value);
//     return acc;
//   }, {});

//   const result = clone(data1, (value) => makeNode(value, null));
//   const updated = clone(data2, (value) => makeNode(null, value));

//   const merge = (object, source) => {
//     const customizer = (objValue, srcValue) => {
//       if (_.isObject(objValue) && _.isObject(srcValue)) {
//         const same = merge(objValue.oldValue, srcValue.newValue);
//         return makeNode(same, same);
//       }
//       return makeNode(objValue, srcValue);
//     };
//     _.mergeWith(object, source, customizer);
//   };

//   merge(result, updated);

//   // const iter = (data) => {
//   //   const entries = _.entries(data);
//   //   return entries.reduce((acc, [key, { oldValue, newValue }]) => {
//   //     if (_.isObject(oldValue)) acc[key] = merge(oldValue, newValue);
//   //     else acc[key] = makeNode(oldValue, newValue);
//   //     return acc;
//   //   }, {});
//   // };

//   return result;
// };

// const buildResult = (data1, data2) => {
//   const containsKey = (obj, key) => obj[key] ?? false;
//   const result = [];
//   Object.entries(data1).forEach(([key, value]) => {
//     if (containsKey(data2, key)) {
//       if (value === data2[key]) result.push(`    ${key}: ${value}`);
//       else {
//         result.push(`  - ${key}: ${value}`);
//         result.push(`  + ${key}: ${data2[key]}`);
//       }
//     } else result.push(`  - ${key}: ${value}`);
//   });
//   Object.entries(data2).forEach(([key, value]) => {
//     if (!containsKey(data1, key)) {
//       result.push(`  + ${key}: ${value}`);
//     }
//   });
//   result.sort((a, b) => {
//     const sign1 = a.slice(0, 4).trim();
//     const [key1, key2] = [a, b].map((item) => item.slice(4).split(':')[0]);
//     if (key1 === key2) return sign1 === '+' ? 1 : -1;
//     return key1 > key2 ? 1 : -1;
//   });
//   return result;
// };

const formatResult = (result) => JSON.stringify(result, null, '  ').replace(/"/g, '');

/* Only works with flat objects! */
// const formatResult = (result) => {
//   const entries = _.entries(result);
//   const lines = entries.reduce((acc, [key, value]) => {
//     const { oldValue, newValue } = value;
//     if (oldValue == null) acc.push(`  + ${key}: ${newValue}`);
//     else if (newValue == null) acc.push(`  - ${key}: ${oldValue}`);
//     else if (oldValue === newValue) acc.push(`    ${key}: ${oldValue}`);
//     else {
//       acc.push(`  - ${key}: ${oldValue}`);
//       acc.push(`  + ${key}: ${newValue}`);
//     }
//     return acc;
//   }, []);
//   lines.sort((a, b) => {
//     const sign1 = a.slice(0, 4).trim();
//     const [key1, key2] = [a, b].map((item) => item.slice(4).split(':')[0]);
//     if (key1 === key2) return sign1 === '+' ? 1 : -1;
//     return key1 > key2 ? 1 : -1;
//   });
//   return ['{', ...lines, '}'].join('\n');
// };

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
