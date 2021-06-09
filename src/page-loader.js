// import _ from 'lodash';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';

// remember about path.format
const generateFilepath = (str, ext = '') => str.replace(/[^a-zA-Z0-9]/g, '-') + ext;

const extractAssets = async (html, url) => {
  const $ = cheerio.load(html);
  const sources = $('img').map((_, el) => $(el).attr('src')).toArray();

  const assetsPromises = sources.map((src) => axios.get(url.origin + src, { responseType: 'stream' }));
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses.map((assetResponse) => assetResponse.data);
}

const pageLoader = async (u, outputDir) => {
  const url = new URL(u);
  const response = await axios.get(url.href);

  const assets = await extractAssets(response.data, url)
  console.log(assets);
  // const state = buildState(html, url)

  // const rootHtmlPath = generateFilepath(url.hostname + url.pathname, '.html');

  // fs.writeFileSync(path.join(outputPath, rootHtmlPath), response.data);
};

export default pageLoader;
