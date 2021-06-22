import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import { extractAssetsFromHtml, updateAssetsHtml } from './assets.js';
import createFiles from './createFiles.js';

const log = debug('page-loader');

const pageLoader = async (u, outputDir = process.cwd()) => {
  const url = new URL(u);
  log('Fetch url', url);
  const response = await axios.get(url.href);
  const html = response.data;

  log('Load html');
  const $ = cheerio.load(html);

  const htmlAssets = extractAssetsFromHtml($);
  log('Extract assets sources from html', htmlAssets);

  const state = buildState(url, htmlAssets, outputDir);
  log('State', state);

  const resultHtml = updateAssetsHtml(state, $);

  log('Create files inside:', outputDir);
  await createFiles(state, resultHtml);

  return Promise.resolve({ filepath: state.htmlFilepath });
};

export default pageLoader;
