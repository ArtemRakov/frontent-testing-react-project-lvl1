import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import axios from 'axios';

const extractAssets = async (sources) => {
  const assetsPromises = sources.map(({ originSrc }) => axios.get(originSrc, { responseType: 'stream' }));
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses.map((assetResponse) => assetResponse.data);
};

const loadFiles = async (state, outputDir, $) => {
  const getFilePath = (filepath) => path.join(outputDir, filepath);

  if (state.assets.length > 0) {
    state.assets.forEach((asset) => {
      const img = $(`img[src='${asset.oldSrc}']`);
      img.attr('src', asset.newSrc);
    });

    fs.mkdirSync(path.join(outputDir, state.assetsDir));
    const assetFiles = await extractAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const data = assetFiles.find((file) => file.responseUrl === asset.originSrc);
      return fsPromises.writeFile(getFilePath(asset.newSrc), data, 'null');
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(getFilePath(state.htmlName), $.html());
};

export default loadFiles;
