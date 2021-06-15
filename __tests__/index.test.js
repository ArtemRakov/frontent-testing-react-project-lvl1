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
const readResultFile = (filename) => readFile(path.join('result', filename));

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

test('loads html with assets', async () => {
  const url = new URL('https://ru.hexlet.io/courses');
  const outputFilePath = (filepath) => path.join(outputDir, filepath);
  const filePaths = {
    initialHtml: 'initial/ru-hexlet-io-courses.html',
    html: 'ru-hexlet-io-courses.html',
    assets: {
      img: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
      css: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
      js: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
      html: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
    },
  };

  const initialHtml = readFile(filePaths.initialHtml);
  const [image, css, js, html] = Object.values(filePaths.assets)
    .map((assetPath) => readResultFile(assetPath));

  nock(url.origin)
    .get(url.pathname)
    .reply(200, initialHtml);

  nock(url.origin)
    .get('/assets/professions/nodejs.png')
    .reply(200, image);

  nock(url.origin)
    .get('/assets/application.css')
    .reply(200, css);

  nock(url.origin)
    .get('/packs/js/runtime.js')
    .reply(200, js);

  nock(url.origin)
    .get('/courses')
    .reply(200, html);

  await pathLoader(url.href, outputDir);

  // map them over each other
  const outputFile = fs.readFileSync(outputFilePath(filePaths.html), 'utf-8');
  const outputImg = fs.readFileSync(outputFilePath(filePaths.assets.img), 'utf-8');

  const expectedHtml = readResultFile(filePaths.html);
  const expectedImg = readResultFile(filePaths.assets.img);

  expect(outputFile).toEqual(expectedHtml);
  expect(outputImg).toEqual(expectedImg);
});
