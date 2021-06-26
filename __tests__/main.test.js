import nock from 'nock';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pathLoader from '../index.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'path-loader-'));

let outputDir;

beforeEach(() => {
  outputDir = createTempDir();
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('simple', () => {
  const url = new URL('http://example.com/test');

  let outputFilePath;
  let exampleHtml;

  beforeEach(() => {
    outputFilePath = path.join(outputDir, 'example-com-test.html');
    exampleHtml = readFile('example-com-test.html');
  });

  test('loads html', async () => {
    nock(url.origin)
      .get(url.pathname)
      .reply(200, exampleHtml);

    await pathLoader(url.href, outputDir);

    const outputFile = fs.readFileSync(outputFilePath, 'utf-8');
    expect(outputFile).toEqual(exampleHtml);
  });
});

describe('complex', () => {
  let outputFilePath;
  let initialHtml;
  let scope;

  const url = new URL('https://ru.hexlet.io/courses');
  const htmlName = 'ru-hexlet-io-courses.html';
  const assets = [
    { url: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
    { url: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
    { url: '/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
    { url: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
  ];

  beforeEach(() => {
    initialHtml = readFile(htmlName);
    outputFilePath = (filepath) => path.join(outputDir, filepath);
    scope = nock(url.origin);
  });

  test('loads html with assets', async () => {
    scope
      .get(url.pathname)
      .reply(200, initialHtml);

    assets.forEach((asset) => {
      scope
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

  test.each([404, 403, 500, 503])('unable to fetch url with status: %p', async (errorCode) => {
    scope
      .get(url.pathname)
      .reply(errorCode);

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('Unable to load html');
  });

  test('unable to fetch assets', async () => {
    scope
      .get(url.pathname)
      .reply(200, initialHtml);

    scope
      .persist()
      .get(/.*/)
      .reply(500);

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('Unable to load assets');
  });

  test('file already exists', async () => {
    scope
      .get(url.pathname)
      .reply(200, initialHtml);

    scope
      .persist()
      .get(/(assets|packs).*/)
      .reply(200, {})

    fs.writeFileSync(outputFilePath(htmlName), '');

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('file already exists');
  });
});
