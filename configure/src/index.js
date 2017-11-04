import yargs from 'yargs';

import args from './args';
import { err } from './log.re';

process.on('unhandledRejection', msg => {
  err(msg);
});

yargs
  .options(args)
  .command(require('./cmds/build.re'))
  .command(require('./cmds/push.re'))
  .command(require('./cmds/deploy.re'))
  .demandCommand()
  .parse();
