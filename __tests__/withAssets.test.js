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
let url;
let htmlName;
let outputFilePath;
let initialHtml;
let assets;

beforeEach(() => {
  outputDir = createTempDir();
  url = new URL('https://ru.hexlet.io/courses');
  htmlName = 'ru-hexlet-io-courses.html';
  outputFilePath = (filepath) => path.join(outputDir, filepath);
  initialHtml = readFile(htmlName);
  assets = [
    { url: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
    { url: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
    { url: '/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
    { url: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
  ];

  nock.disableNetConnect();
});

afterEach(() => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('positive', () => {
  test('loads html with assets', async () => {
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
    expect(outputHtml).toEqual(expectedHtml);

    // maybe move this to test.each?
    assets.forEach((asset) => {
      const expected = readFile(`expected/${asset.path}`);
      const output = fs.readFileSync(outputFilePath(asset.path), 'utf-8');
      expect(output).toEqual(expected);
    });
  });
});

describe('negative', () => {
  test('unable to fetch url', async () => {
    nock(url.origin)
      .get(url.pathname)
      .reply(404);

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow(url.href);
  });

  test('unable to fetch assets', async () => {
    nock(url.origin)
      .get(url.pathname)
      .reply(200, initialHtml);

    assets.forEach((asset) => {
      nock(url.origin)
        .get(asset.url)
        .reply(500);
    });

    // not sure how to do this better
    await expect(pathLoader(url.href, outputDir)).rejects.toThrow();
  });
});
