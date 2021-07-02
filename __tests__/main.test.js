import nock from 'nock';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pathLoader from '../index.js';
const { spawn } = require('child_process');
const ls = spawn('whoami')


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

describe('positive:', () => {
  const cases = [
    { url: new URL('http://example.com/test'), html: 'example-com-test.html', assets: [] },
    {
      url: new URL('https://ru.hexlet.io/courses'),
      html: 'ru-hexlet-io-courses.html',
      assets: [
        { url: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
        { url: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
        { url: '/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
        { url: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
      ],
    },
  ];

  beforeEach(() => {
    cases.forEach(({ url, html, assets }) => {
      const scope = nock(url.origin);

      scope
        .get(url.pathname)
        .replyWithFile(200, getFixturePath(html));

      assets.forEach((asset) => {
        scope
          .get(asset.url)
          .replyWithFile(200, getFixturePath(`expected/${asset.path}`));
      });
    });
  });

  test.each(cases)('loads html: $html', async ({ url, html, assets }) => {
    const outputFilePath = (filepath) => path.join(outputDir, filepath);

    await pathLoader(url.href, outputDir);

    const expectedHtml = readFile(`expected/${html}`);
    const outputHtml = fs.readFileSync(outputFilePath(html), 'utf-8');
    expect(outputHtml).toEqual(expectedHtml);

    assets.forEach((asset) => {
      const expected = readFile(`expected/${asset.path}`);
      const output = fs.readFileSync(outputFilePath(asset.path), 'utf-8');
      expect(output).toEqual(expected);
    });
  });
});

describe('negative:', () => {
  let url;
  let scope;
  let html;
  let outputFilePath;

  beforeEach(() => {
    url = new URL('https://ru.hexlet.io/courses');
    scope = nock(url.origin);
    html = 'ru-hexlet-io-courses.html';
    outputFilePath = (filepath) => path.join(outputDir, filepath);
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
      .replyWithFile(200, getFixturePath(html));

    scope
      .persist()
      .get(/(assets|packs).*/)
      .reply(500);

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('Unable to load assets');
  });

  test('file already exists', async () => {
    scope
      .get(url.pathname)
      .replyWithFile(200, getFixturePath(html));

    scope
      .persist()
      .get(/(assets|packs).*/)
      .reply(200, {});

    fs.writeFileSync(outputFilePath(html), '');

    await expect(pathLoader(url.href, outputDir)).rejects.toThrow('file already exists');
  });

  test('dont have write permission', async () => {
    scope
      .get(url.pathname)
      .replyWithFile(200, getFixturePath(html));

    scope
      .persist()
      .get(/(assets|packs).*/)
      .reply(200, {});

    const myDirPath = path.join(outputDir, 'no_write_permission');
    fs.mkdirSync(myDirPath, { mode: 0o000 });

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });


    await expect(pathLoader(url.href, myDirPath)).rejects.toThrow('permission denied');
  });
});
