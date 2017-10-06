import yargs from 'yargs';

import args from './args';
import { err } from './log';

process.on('unhandledRejection', msg => {
  err(msg);
});

yargs
  .options(args)
  .command(require('./cmds/build'))
  .command(require('./cmds/push'))
  .command(require('./cmds/deploy'))
  .demandCommand()
  .parse();
