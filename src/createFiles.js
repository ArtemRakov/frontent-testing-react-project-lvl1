import fs from 'fs';
import { loadAssets } from './assets.js';

const createFiles = async (state, html) => {
  if (state.assets.length > 0) {
    fs.mkdirSync(state.assetsDirPath);
    const assetsResponses = await loadAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const response = assetsResponses.find((res) => res.config.url === asset.src.origin);
      const input = response.data;
      const writer = fs.createWriteStream(asset.filepath, { flags: 'wx' });

      input.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('error', reject);
        writer.on('finish', resolve);
      });
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(state.htmlFilepath, html, { flag: 'wx' });
};

export default createFiles;
