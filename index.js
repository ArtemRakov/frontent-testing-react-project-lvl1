import axios from 'axios';
import cheerio from 'cheerio';

import buildState from './src/state.js';
import findAssets from './src/assets.js';
import loadFiles from './src/loadFiles.js';


const pageLoader = async (u, outputDir) => {
  const url = new URL(u);
  const response = await axios.get(url.href);
  const html = response.data;

  const $ = cheerio.load(html);
  const assetSources = findAssets($);

  const state = buildState(url, assetSources);

  await loadFiles(state, outputDir, $);
};

export default pageLoader;
