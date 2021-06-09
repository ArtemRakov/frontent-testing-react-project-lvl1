// import _ from 'lodash';
import path from 'path';

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

export default buildState;
