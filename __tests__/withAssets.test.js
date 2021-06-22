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

const assets = [
  { url: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png', ttype: 'image/png' },
  { url: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css', type: 'text/css' },
  { url: '/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js', type: 'application/javascript' },
  { url: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html', type: 'text/html' },
];

test('loads html with assets', async () => {
  const url = new URL('https://ru.hexlet.io/courses');
  const htmlName = 'ru-hexlet-io-courses.html';
  const outputFilePath = (filepath) => path.join(outputDir, filepath);
  const initialHtml = readFile(htmlName);

  nock(url.origin)
    .get(url.pathname)
    .reply(200, initialHtml);

  assets.forEach((asset) => {
    nock(url.origin)
      .get(asset.url)
      .replyWithFile(200, getFixturePath(`expected/${asset.path}`));
  });

  await pathLoader(url.href, outputDir);

  const expectedHtml = readFile(`expected/${htmlName}`);
  const outputHtml = fs.readFileSync(outputFilePath(htmlName), 'utf-8');
  expect(expectedHtml).toEqual(outputHtml);

  assets.forEach((asset) => {
    const expected = readFile(`expected/${asset.path}`, 'utf-8');
    const output = fs.readFileSync(outputFilePath(asset.path), 'utf-8');
    expect(expected).toEqual(output);
  });
});
