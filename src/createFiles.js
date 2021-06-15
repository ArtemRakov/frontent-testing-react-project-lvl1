import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import axios from 'axios';
import 'axios-debug-log';

const extractAssets = async (sources) => {
  const assetsPromises = sources.map(({ originSrc, responseType }) => {
    const request = axios.get(originSrc, { responseType });

    return request;
  });
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses;
};

const createFiles = async (state, outputDir, $) => {
  const getFilePath = (filepath) => path.join(outputDir, filepath);

  if (state.assets.length > 0) {
    state.assets.forEach((asset) => {
      const tag = $(`${asset.tag}[${asset.attr}='${asset.oldSrc}']`);
      tag.attr(asset.attr, asset.newSrc);
    });

    fs.mkdirSync(path.join(outputDir, state.assetsDir));
    const assetsResponses = await extractAssets(state.assets, state.origin);

    const creationPromises = state.assets.map((asset) => {
      const response = assetsResponses.find((res) => res.config.url === asset.originSrc);
      return fsPromises.writeFile(getFilePath(asset.newSrc), response.data);
    });

    await Promise.all(creationPromises);
  }

  fs.writeFileSync(getFilePath(state.htmlName), $.html());
};

export default createFiles;
