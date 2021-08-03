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

const json1 = getFixturePath('nestedfile1.json');
const json2 = getFixturePath('nestedfile2.json');

const yaml1 = getFixturePath('nested1.yaml');
const yaml2 = getFixturePath('nested2.yaml');

const flatOutput = readFileSync(getFixturePath('flatoutput.txt'), 'utf-8');

const nestedOutput = readFileSync(getFixturePath('nestedoutput.txt'), 'utf-8');

const plainOutput = readFileSync(getFixturePath('plainoutput.txt'), 'utf-8');

const style = 'stylish';

test('diff with flat json', () => {
  // console.log(diff(flatjson1, flatjson2, style));
  expect(diff(flatjson1, flatjson2, style)).toEqual(flatOutput);
});

test('diff with nested json', () => {
  // console.log(diff(json1, json2, style));
  expect(diff(json1, json2, style)).toEqual(nestedOutput);
});

test('diff with nested yaml', () => {
  expect(diff(yaml1, yaml2, style)).toEqual(nestedOutput);
});

test('diff with plain output', () => {
  console.log(diff(json1, json2, 'plain'));
  expect(diff(json1, json2, 'plain')).toEqual(plainOutput);
});

// test('diff with json output', () => {
//   console.log(diff(json1, json2, 'json'));
//   expect(diff(json1, json2, 'json')).toEqual(plainOutput);
// });
