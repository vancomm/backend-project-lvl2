/* eslint-disable jest/no-commented-out-tests */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import diff from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const json1 = getFixturePath('file1.json');
const json2 = getFixturePath('file2.json');

const yaml1 = getFixturePath('file1.yaml');
const yaml2 = getFixturePath('file2.yaml');

const output = readFileSync(getFixturePath('output.txt'), 'utf-8');

test('diff with flat json', () => {
  expect(diff(json1, json2)).toEqual(output);
});

test('diff with flat yaml', () => {
  expect(diff(yaml1, yaml2)).toEqual(output);
});
