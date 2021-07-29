/* eslint-disable jest/no-commented-out-tests */
import { readFileSync } from 'fs';
import diff, { normalizePath, containsKey } from '../src/diff.js';

const filename1 = './__tests__/file1.json';
const filename2 = '__tests__/file2.json';
const output = readFileSync(normalizePath('__tests__/output.txt'), 'utf-8');

test('containsKey', () => {
  const data = { key1: 'value', key2: 'value' };
  expect(containsKey(data, 'key1')).toBeTruthy();
  expect(containsKey(data, 'key3')).toBe(false);
});

test('normalizePath', () => {
  expect(normalizePath(filename1)).toEqual('/home/vancomm/backend-project-lvl2/__tests__/file1.json');
  expect(normalizePath(filename2)).toEqual('/home/vancomm/backend-project-lvl2/__tests__/file2.json');
});

test('diff', () => {
  expect(diff(filename1, filename2)).toEqual(output);
});
