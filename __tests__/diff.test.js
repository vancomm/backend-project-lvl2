/* eslint-disable no-unused-vars */
/* eslint-disable jest/no-commented-out-tests */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import diff from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const flatjson1 = getFixturePath('flatfile1.json');
const flatjson2 = getFixturePath('flatfile2.json');

let flatOutput;

const json1 = getFixturePath('nestedfile1.json');
const json2 = getFixturePath('nestedfile2.json');

const yaml1 = getFixturePath('nested1.yaml');
const yaml2 = getFixturePath('nested2.yaml');

let nestedOutput;

const style = 'stylish';

beforeAll(() => {
  flatOutput = readFileSync(getFixturePath('flatoutput.txt'), 'utf-8');
  nestedOutput = readFileSync(getFixturePath('nestedoutput.txt'), 'utf-8');
});

test('diff with flat json', () => {
  console.log(diff(flatjson1, flatjson2, style));
  expect(diff(flatjson1, flatjson2, style)).toEqual(flatOutput);
});

test('diff with nested json', () => {
  console.log(diff(json1, json2, style));
  expect(diff(json1, json2, style)).toEqual(nestedOutput);
});

test('diff with nested yaml', () => {
  expect(diff(yaml1, yaml2, style)).toEqual(nestedOutput);
});
