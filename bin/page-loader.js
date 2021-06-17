#!/usr/bin/env node

import { program } from 'commander';
import pageLoader from '../index.js';

program.version('0.0.1');

program
  .arguments('<url>')
  .description('use page loader to save web pages locally')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    console.log(pageLoader(url, options.output));
    process.exit();
  });

program.parse(process.argv);
