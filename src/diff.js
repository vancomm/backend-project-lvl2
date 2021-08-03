import { existsSync, readFileSync } from 'fs';
import path from 'path';
import buildResult from './buildResult.js';
import { fromJSON, fromYAML } from './parsers.js';
import { debug, stylish } from './formatters.js';

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

const getFormatter = (option) => {
  if (option === 'debug') return debug;
  if (option === 'stylish') return stylish;
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
