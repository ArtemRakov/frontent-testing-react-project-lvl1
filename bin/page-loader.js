#!/usr/bin/env node

import { program } from 'commander';
import pageLoader from '../index.js';

program.version('0.0.1');

program
  .arguments('<url>')
  .description('use page loader to save web pages locally')
  .option('-o, --output [dir]', 'output dir', '/app')
  .action((url) => {
    console.log(pageLoader(url));
  });

program.parse(process.argv);
