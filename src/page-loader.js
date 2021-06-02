// import _ from 'lodash';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// remember about path.format
const filepathFromUrl = (url) => {
  const urlWithoutProtocol = url.hostname + url.pathname;
  const filepath = urlWithoutProtocol.replace(/[^a-zA-Z0-9]/g, '-');
  return `${filepath}.html`;
};

const pageLoader = async (u, outputPath) => {
  const url = new URL(u);
  const response = await axios.get(url.href);

  const filename = filepathFromUrl(url);

  fs.writeFileSync(path.join(outputPath, filename), response.data);
};

export default pageLoader;
