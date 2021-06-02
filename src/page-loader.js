// import _ from 'lodash';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// remember about path.format
const generateFilepath = (str, ext = '') => str.replace(/[^a-zA-Z0-9]/g, '-') + ext;

const pageLoader = async (u, outputPath) => {
  const url = new URL(u);
  const response = await axios.get(url.href);

  const rootHtmlPath = generateFilepath(url.hostname + url.pathname, '.html');

  fs.writeFileSync(path.join(outputPath, rootHtmlPath), response.data);
};

export default pageLoader;
