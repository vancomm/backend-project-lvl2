import { existsSync, readFileSync } from 'fs';
import path from 'path';
import makeTree from './tree.js';
import getParser from './parsers.js';
import getFormatter from './formatters/index.js';

const normalizePath = (filepath) => path.resolve(process.cwd(), filepath);

const diff = (filename1, filename2, formatterOption = 'stylish') => {
  const path1 = normalizePath(filename1);
  const path2 = normalizePath(filename2);

  if (!existsSync(path1) || !existsSync(path2)) {
    return 'Can\'t find files';
  }

  const ext1 = path.extname(path1);
  const ext2 = path.extname(path2);

  const data1 = (getParser(ext1))(readFileSync(path1, 'utf-8'));
  const data2 = (getParser(ext2))(readFileSync(path2, 'utf-8'));

  const tree = makeTree(data1, data2);

  const formatTree = getFormatter(formatterOption);
  const formatted = formatTree(tree);
  return formatted;
};

export default diff;
