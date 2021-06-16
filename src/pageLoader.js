import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import { extractAssetsFromHtml } from './assets.js';
import createFiles from './createFiles.js';

const log = debug('page-loader');

const pageLoader = async (u, outputDir) => {
  const url = new URL(u);
  log('Fetch url');
  const response = await axios.get(url.href);
  const html = response.data;

  log('Load html');
  const $ = cheerio.load(html);

  log('Extract assets sources from html');
  const htmlAssets = extractAssetsFromHtml($);

  log('Build state');
  const state = buildState(url, htmlAssets);

  log('Create files');
  await createFiles(state, outputDir, $);
};

export default pageLoader;
