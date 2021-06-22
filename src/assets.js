import axios from 'axios';
import 'axios-debug-log';

const tags = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const extractAssetsFromHtml = ($) => Object.keys(tags).map((tag) => {
  const attr = tags[tag];
  return $(tag).map((_, el) => ({ tag, attr, src: $(el).attr(attr) })).toArray();
}).flat();

const loadAssets = async (sources) => {
  const assetsPromises = sources.map(({ src }) => {
    const request = axios.get(src.origin, { responseType: 'stream' });

    return request;
  });
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses;
};

const updateAssetsHtml = (state, $) => {
  state.assets.forEach((asset) => {
    const tag = $(`${asset.tag}[${asset.attr}='${asset.src.old}']`);
    tag.attr(asset.attr, asset.src.new);
  });

  return $.html();
};

export { extractAssetsFromHtml, loadAssets, updateAssetsHtml };
