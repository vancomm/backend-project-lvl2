import _ from 'lodash';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fromJSON, fromYAML } from './parsers.js';

const normalizePath = (file) => path.resolve(process.cwd(), file);

const getParser = (ext) => {
  if (ext === '.json') {
    return fromJSON;
  }
  if (ext === '.yaml' || ext === '.yml') {
    return fromYAML;
  }
  return fromJSON;
};

const containsKey = (obj, key) => (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'undefined');

const buildResult = (data1, data2) => {
  const makeNode = (oldValue, newValue = undefined) => ({ oldValue, newValue });

  const iter1 = (subj, ref, res) => {
    const members = _.entries(subj);
    members.forEach(([key, value]) => {
      if (containsKey(ref, key)) {
        if (_.isObject(value)) {
          res[key] = {};
          iter1(value, ref[key], res[key]);
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
          iter2(value, ref[key], res[key]);
        }
      } else {
        res[key] = makeNode(undefined, value);
      }
    });
  };

  const result = {};
  iter1(data1, data2, result);
  iter2(data2, data1, result);
  return result;
};

const getFormatter = (option) => {
  const debug = (data) => JSON.stringify(data, null, '  ').replace(/"/g, '');

  const stylish = debug;

  const test = (data) => {
    const pref = (level, sign = '', spaces = 4) => (sign === ''
      ? ' '.repeat(spaces * level)
      : ' '.repeat(spaces * (level - 1)).concat(`  ${sign} `)
    );

    const addData = (key, value, res, level, sign, recursiveCall) => {
      if (_.isObject(value)) { //                           version is an object
        res.push(`${pref(level, sign)}${key}: {`);
        recursiveCall(value, res, level + 1);
        res.push(`${pref(level)}}`);
      } else { //                                           version is plain data
        res.push(`${pref(level, sign)}${key}: ${value}`);
      }
    };

    /**
     * Returns info on what versions value has.
     *
     *  Version numbers:
     *  -1: no versions,
     *  0:  only old      (deleted),
     *  1:  old and new   (updated),
     *  2:  only new      (added).
     *
     * @param {object} value Value to get versions of.
     * @return {number} Info on versions of the value.
    */
    const getVersion = (value) => {
      const hasOld = containsKey(value, 'oldValue');
      const hasNew = containsKey(value, 'newValue');

      if (hasOld && !hasNew) return 0;
      if (hasOld && hasNew) return 1;
      if (!hasOld && hasNew) return 2;

      return -1;
    };

    const addDataWithVersions = (key, value, res, level, recursiveCall, version) => {
      if (version === 1) { //                           member has two versions
        const { oldValue, newValue } = value;
        if (oldValue === newValue) { //                     two versions are the same
          addData(key, oldValue, res, level, '', recursiveCall);
        } else { //                                         two versions are different
          addData(key, oldValue, res, level, '-', recursiveCall);
          addData(key, newValue, res, level, '+', recursiveCall);
        }
      } else if (version === 0) { //                    member only has an old version
        const { oldValue } = value;
        addData(key, oldValue, res, level, '-', recursiveCall);
      } else if (version === 2) { //                    member only has a new version
        const { newValue } = value;
        addData(key, newValue, res, level, '+', recursiveCall);
      }
    };

    const iter = (subj, res, level) => {
      const members = _.entries(subj);
      members.sort((a, b) => (a[0] > b[0] ? 1 : -1));
      members.forEach(([key, value]) => {
        const version = getVersion(value);
        if (version === -1) { //                          member doesn't have versions
          addData(key, value, res, level, '', iter);
        } else { //                                       member has versions
          addDataWithVersions(key, value, res, level, iter, version);
        }
      });
    };

    const result = [];

    result.push('{');
    iter(data, result, 1);
    result.push('}');
    return result.join('\n');
  };

  if (option === 'debug') return debug;

  if (option === 'stylish') return stylish;

  if (option === 'test') return test;

  return debug;
};

const diff = (filename1, filename2, formatterOption = 'stylish') => {
  const [path1, path2] = [filename1, filename2].map(normalizePath);
  if (!existsSync(path1) || !existsSync(path2)) {
    return 'Can\'t find files';
  }
  const [file1, file2] = [path1, path2].map((item) => readFileSync(item, 'utf-8'));

  const [ext1, ext2] = [path1, path2].map(path.extname);
  if (ext1.valueOf() !== ext2.valueOf()) {
    return 'Can\'t compare files with different extensions';
  }
  const parse = getParser(ext1);

  const [data1, data2] = [file1, file2].map(parse);
  const result = buildResult(data1, data2);

  const formatResult = getFormatter(formatterOption);
  const formatted = formatResult(result);
  return formatted;
};

export default diff;
