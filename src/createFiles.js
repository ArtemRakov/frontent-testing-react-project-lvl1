import fs from 'fs';
import path from 'path';
import { loadAssets } from './assets.js';

const createFiles = async (state, $) => {
  if (state.assets.length > 0) {
    // мб вынести в отдельную штуку
    state.assets.forEach((asset) => {
      const tag = $(`${asset.tag}[${asset.attr}='${asset.src.old}']`);
      tag.attr(asset.attr, asset.src.new);
    });

    fs.mkdirSync(state.assetsDirPath);
    const assetsResponses = await loadAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const response = assetsResponses.find((res) => res.config.url === asset.src.origin);
      const input = response.data;
      const output = fs.createWriteStream(asset.filepath, { flags: 'w+' });

      return new Promise((resolve, reject) => {
        output.on('error', reject);
        input.on('error', reject);
        input.on('end', resolve);

        input.pipe(output);
      });
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(state.htmlFilepath, $.html());
};

export default createFiles;
