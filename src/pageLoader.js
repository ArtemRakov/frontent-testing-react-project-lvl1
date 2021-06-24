import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import { extractAssetsFromHtml, updateAssetsHtml } from './assets.js';
import createFiles from './createFiles.js';

const log = debug('page-loader');

const getPageData = async (url) => {
  log('Fetch url', url);
  try {
    const response = await axios.get(url.href);
    return response.data;
  } catch (e) {
    throw new Error([e.message, `URL: ${e.config.url}`].join(' '));
  }
};

const pageLoader = async (u, outputDir) => {
  if (!outputDir) {
    throw new Error('Output directory does not exists');
  }

  const url = new URL(u);
  const html = await getPageData(url);
  const $ = cheerio.load(html);

  const htmlAssets = extractAssetsFromHtml($);
  log('Extract assets sources from html', htmlAssets);

  const state = buildState(url, htmlAssets, outputDir);
  log('State', state);

  const resultHtml = updateAssetsHtml(state, $);

  log('Create files inside:', outputDir);
  await createFiles(state, resultHtml);

  return { filepath: state.htmlFilepath };
};

export default pageLoader;
