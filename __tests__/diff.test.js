/* eslint-disable no-unused-vars */
/* eslint-disable jest/no-commented-out-tests */
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import diff from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename, ...subfolders) => path.join(__dirname, '..', '__fixtures__', ...subfolders, filename);

const formats = ['json', 'yaml'];

let expected;

describe('flat files', () => {
  beforeAll(async () => {
    const expectedPath = getFixturePath('flatoutput.txt', 'expected');
    expected = await readFile(expectedPath, 'utf-8');
  });

  test.each(formats)('%s', (format) => {
    const filepath1 = getFixturePath(`flatfile1.${format}`, 'actual');
    const filepath2 = getFixturePath(`flatfile2.${format}`, 'actual');
    const actual = diff(filepath1, filepath2);
    expect(actual).toEqual(expected);
  });
});

describe('nested files', () => {
  beforeAll(async () => {
    const expectedPath = getFixturePath('nestedoutput.txt', 'expected');
    expected = await readFile(expectedPath, 'utf-8');
  });

  test.each(formats)('%s', (format) => {
    const filepath1 = getFixturePath(`nestedfile1.${format}`, 'actual');
    const filepath2 = getFixturePath(`nestedfile2.${format}`, 'actual');
    const actual = diff(filepath1, filepath2);
    expect(actual).toEqual(expected);
  });
});

describe('nested files, plain output', () => {
  beforeAll(async () => {
    const expectedPath = getFixturePath('nestedplainoutput.txt', 'expected');
    expected = await readFile(expectedPath, 'utf-8');
  });

  test.each(formats)('%s', (format) => {
    const filepath1 = getFixturePath(`nestedfile1.${format}`, 'actual');
    const filepath2 = getFixturePath(`nestedfile2.${format}`, 'actual');
    const actual = diff(filepath1, filepath2, 'plain');
    expect(actual).toEqual(expected);
  });
});
