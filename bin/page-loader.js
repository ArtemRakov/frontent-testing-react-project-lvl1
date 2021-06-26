#!/usr/bin/env node

import { program } from 'commander';
import pageLoader from '../index.js';

program.version('0.0.1');

program
  .arguments('<url>')
  .description('use page loader to save web pages locally')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action(async (url, options) => {
    try {
      const info = await pageLoader(url, options.output);
      console.log(`Page was successfully downloaded into ${info.filepath}`);
    } catch (e) {
      console.error(e.message);

      process.exit(1);
    }
  });

program.parse(process.argv);
