import { test, expect } from '@jest/globals';
import yo from '../index.js';

test('yo', () => {
  expect(yo(6)).toBe(3);
});
