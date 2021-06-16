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
  const assetsPromises = sources.map(({ src, responseType }) => {
    const request = axios.get(src.origin, { responseType });

    return request;
  });
  const assetsResponses = await Promise.all(assetsPromises);
  return assetsResponses;
};

export { extractAssetsFromHtml, loadAssets };
