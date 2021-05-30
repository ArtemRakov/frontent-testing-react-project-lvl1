import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pathLoader from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'path-loader-'));

// const cases = ['plain-html'];

beforeEach(() => {
  // cases.forEach(createTempDir);
  nock.disableNetConnect();
});

afterEach(() => {
  // cases.forEach((pathToFile) => fs.rmdirSync(pathToTempDir(pathToFile)));
  nock.cleanAll();
  nock.enableNetConnect();
});

test('loads html', async () => {
  const outputPath = createTempDir();
  const url = 'http://example.com';
  const outputFilePath = path.join(outputPath, 'example.html');
  const exampleHtml = readFile('example.html');

  nock(url)
    .get('/')
    .reply(200, exampleHtml);

  await pathLoader(url, outputPath);

  const outputFile = fs.readFileSync(outputFilePath);
  expect(outputFile).toEqual(exampleHtml);
});
