const tags = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const findAssets = ($) => Object.keys(tags).map((tag) => {
  const attr = tags[tag];
  return $(tag).map((_, el) => ({ tag, attr, src: $(el).attr(attr) })).toArray();
}).flat();

export default findAssets;
