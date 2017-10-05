#!/usr/bin/env node
import yargs from 'yargs';

import args from './args';
import { err } from './log';

process.on('unhandledRejection', msg => {
  err(msg);
});

yargs
  .options(args)
  .commandDir('cmds')
  .demandCommand()
  .parse();
