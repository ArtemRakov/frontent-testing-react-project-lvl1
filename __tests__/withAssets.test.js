import nock from 'nock';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pathLoader from '../index.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'path-loader-'));

let outputDir;
let initialHtml;

const url = new URL('https://ru.hexlet.io/courses');
const htmlName = 'ru-hexlet-io-courses.html';
const assets = [
  { url: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
  { url: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
  { url: '/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
  { url: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
];

beforeEach(() => {
  outputDir = createTempDir();
  initialHtml = readFile(htmlName);
  nock.disableNetConnect();
});

afterEach(() => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('positive', () => {
  test('loads html with assets', async () => {
    const outputFilePath = (filepath) => path.join(outputDir, filepath);

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

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('Request failed');
  });

  test('unable to fetch assets', async () => {
    nock(url.origin)
      .persist()
      .get(url.pathname)
      .reply(200, initialHtml)
      .get(/.*/)
      .reply(500);

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('Request failed');
  });

  test('file already exists', async () => {
    const outputFilePath = (filepath) => path.join(outputDir, filepath);

    nock(url.origin)
      .persist()
      .get(url.pathname)
      .reply(200, initialHtml)
      .get(/.*/)
      .reply(200, {});

    fs.writeFileSync(outputFilePath(htmlName), '');

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('file already exists');
  });
});
