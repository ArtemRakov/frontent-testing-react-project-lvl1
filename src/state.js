import path from 'path';

const generateFilepath = (str, ext = '') => str.replace(/[^a-zA-Z0-9]/g, '-') + ext;

const generateAsset = (url, assetsDir, { tag, src, attr }) => {
  const assetUrl = new URL(src, url.origin);

  const { ext, dir, name } = path.parse(assetUrl.hostname + assetUrl.pathname);
  const extWithDefault = ext === '' ? '.html' : ext;
  const filePathWithoutExt = path.join(dir, name);

  const newSrc = path.join(assetsDir, generateFilepath(filePathWithoutExt, extWithDefault));
  const originSrc = assetUrl.origin + assetUrl.pathname;

  return {
    src: {
      origin: originSrc,
      old: src,
      new: newSrc,
    },
    responseType: tag === 'img' ? 'stream' : 'json',
    tag,
    attr,
  };
};

const buildState = (url, assetSources) => {
  const { origin, hostname, pathname } = url;
  const root = generateFilepath(hostname + pathname);
  const assetsDir = `${root}_files`;

  const filteredAssets = assetSources.filter(({ src }) => (
    new URL(src, url.origin).origin === url.origin
  ));

  const assets = filteredAssets.map((asset) => generateAsset(url, assetsDir, asset));

  return {
    origin,
    assets,
    assetsDir,
    html: generateFilepath(root, '.html'),
  };
};

export default buildState;
