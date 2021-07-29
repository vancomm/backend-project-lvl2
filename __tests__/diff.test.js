/* eslint-disable jest/no-commented-out-tests */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import diff from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const filename1 = getFixturePath('file1.json');
const filename2 = getFixturePath('file2.json');
const output = readFileSync(getFixturePath('output.txt'), 'utf-8');

test('diff', () => {
  expect(diff(filename1, filename2)).toEqual(output);
});
