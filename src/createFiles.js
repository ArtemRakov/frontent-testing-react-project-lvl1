import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { loadAssets } from './assets.js';

const createFiles = async (state, outputDir, $) => {
  const getFilePath = (filepath) => path.join(outputDir, filepath);

  if (state.assets.length > 0) {
    state.assets.forEach((asset) => {
      const tag = $(`${asset.tag}[${asset.attr}='${asset.src.old}']`);
      tag.attr(asset.attr, asset.src.new);
    });

    fs.mkdirSync(path.join(outputDir, state.assetsDir));
    const assetsResponses = await loadAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const response = assetsResponses.find((res) => res.config.url === asset.src.origin);
      return fsPromises.writeFile(getFilePath(asset.src.new), response.data);
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(getFilePath(state.htmlName), $.html());
};

export default createFiles;
