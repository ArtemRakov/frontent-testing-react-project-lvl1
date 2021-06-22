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

let outputDir;

beforeEach(() => {
  outputDir = createTempDir();
  nock.disableNetConnect();
});

afterEach(() => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  nock.cleanAll();
  nock.enableNetConnect();
});

test('loads html', async () => {
  const url = new URL('http://example.com/test');
  const outputFilePath = path.join(outputDir, 'example-com-test.html');
  const exampleHtml = readFile('example-com-test.html');

  nock(url.origin)
    .get(url.pathname)
    .reply(200, exampleHtml);

  await pathLoader(url.href, outputDir);

  const outputFile = fs.readFileSync(outputFilePath, 'utf-8');
  expect(outputFile).toEqual(exampleHtml);
});
