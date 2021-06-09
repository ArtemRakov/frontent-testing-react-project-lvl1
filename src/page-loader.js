import axios from 'axios';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

// remember about path.format
const generateFilepath = (str, ext = '') => str.replace(/[^a-zA-Z0-9]/g, '-') + ext;

const buildState = (url, assetSources) => {
  const { origin, hostname, pathname } = url;
  const root = generateFilepath(hostname + pathname);
  const assetsDir = `${root}_files`;
  const assertPrefix = generateFilepath(hostname);

  const assets = assetSources.map((src) => {
    const { ext, dir, name } = path.parse(src);
    const filePathWithoutExt = path.join(dir, name);
    const newSrc = path.join(assetsDir, assertPrefix + generateFilepath(filePathWithoutExt, ext));

    return {
      oldSrc: src,
      originSrc: origin + src,
      newSrc,
    };
  });

  return {
    origin,
    assets,
    htmlName: generateFilepath(root, '.html'),
    assetsDir,
  };
};

const extractAssets = async (sources) => {
  const assetsPromises = sources.map(({ originSrc }) => axios.get(originSrc, { responseType: 'stream' }));
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses.map((assetResponse) => assetResponse.data);
};

const pageLoader = async (u, outputDir) => {
  const url = new URL(u);
  const response = await axios.get(url.href);
  const html = response.data;

  const $ = cheerio.load(html);
  const assetSources = $('img').map((_, el) => $(el).attr('src')).toArray();

  const state = buildState(url, assetSources);

  if (state.assets.length > 0) {
    state.assets.forEach((asset) => {
      const img = $(`img[src='${asset.oldSrc}']`);
      img.attr('src', asset.newSrc);
    });

    fs.mkdirSync(path.join(outputDir, state.assetsDir));
    const assetFiles = await extractAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const data = assetFiles.find((file) => file.responseUrl === asset.originSrc);
      return fsPromises.writeFile(path.join(outputDir, asset.newSrc), data);
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(path.join(outputDir, state.htmlName), $.html());
};

export default pageLoader;
