import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import findAssets from './assets.js';
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
  const assetSources = findAssets($);

  log('Build state');
  const state = buildState(url, assetSources);

  log('Create files');
  await createFiles(state, outputDir, $);
};

export default pageLoader;
