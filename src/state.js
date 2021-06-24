import _ from 'lodash';
import path from 'path';
import debug from 'debug';

const log = debug('page-loader');

const generateFilepath = (str, ext = '') => str.replace(/[^a-zA-Z0-9]/g, '-') + ext;

const generateAsset = (url, assetsDir, outputDir, { tag, src, attr }) => {
  const assetUrl = new URL(src, url.origin);

  const { ext, dir, name } = path.parse(assetUrl.hostname + assetUrl.pathname);
  const extWithDefault = ext === '' ? '.html' : ext;
  const filePathWithoutExt = path.join(dir, name);

  const newSrc = path.join(assetsDir, generateFilepath(filePathWithoutExt, extWithDefault));
  const originSrc = assetUrl.origin + assetUrl.pathname;

  log('sources for asset', { origin: originSrc, old: src, new: newSrc });

  return {
    src: {
      origin: originSrc,
      old: src,
      new: newSrc,
    },
    tag,
    attr,
    filepath: path.join(outputDir, newSrc),
  };
};

const buildState = (url, assetSources, outputDir) => {
  const { origin, hostname, pathname } = url;
  const root = pathname === '/' ? generateFilepath(hostname) : generateFilepath(hostname + pathname);
  const assetsDir = `${root}_files`;

  const uniqueAssets = _.uniq(assetSources);
  const filteredAssets = uniqueAssets.filter(({ src }) => (
    new URL(src, url.origin).origin === url.origin
  ));

  const assets = filteredAssets.map((asset) => generateAsset(url, assetsDir, outputDir, asset));

  return {
    origin,
    assets,
    assetsDirPath: path.join(outputDir, assetsDir),
    htmlFilepath: path.join(outputDir, root.concat('.html')),
  };
};

export default buildState;
