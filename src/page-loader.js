// import _ from 'lodash';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const generateFilenameFromUrl = (url) => {
  const urlWithoutProtocol = url.hostname + url.pathname;
  return `${urlWithoutProtocol.replace('/', '')}.html`;
};

const pageLoader = async (u, outputPath) => {
  const url = new URL(u);
  const response = await axios.get(url.href);

  const filename = generateFilenameFromUrl(url);

  fs.writeFileSync(path.join(outputPath, filename), response.data);
};

export default pageLoader;
