import _ from 'lodash';
import axios from 'axios';

const pageLoader = async (u, outputPath) => {
  const url = new URL(u);

  const response = await axios.get(url.href);
  console.log(response.data);
};

export default pageLoader;
