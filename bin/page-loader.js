#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import pageLoader from '../index.js';

program.version('0.0.1');

program
  .arguments('<url>')
  .description('use page loader to save web pages locally')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action(async (url, options) => {
    try {
      const info = await pageLoader(url, options.output);
      console.log(`Page was successfully downloaded into ${path.join(options.output, info.filepath)}`);
      process.exit();
    } catch (e) {
      // if (e.isAxiosError) {
      //   console.error(e);
      // } else {
      // }

      process.exit(1);
    }
  });

program.parse(process.argv);
