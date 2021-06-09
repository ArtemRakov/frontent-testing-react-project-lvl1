const findAssets = ($) => {
  const assetSources = $('img').map((_, el) => $(el).attr('src')).toArray();

  return assetSources;
};

export default findAssets;
