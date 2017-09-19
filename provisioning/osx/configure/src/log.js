import chalk from 'chalk';
import { curry } from 'ramda';

export const log = txt => {
  process.stdout.write(`${txt}\n`);
};

export const err = txt => {
  process.stderr.write(`\n${chalk`{red ERROR: ${txt}}`}\n`);
};

export const warn = txt => {
  process.stderr.write(`\n${chalk`{yellow WARNING: ${txt}}`}\n`);
};

export const step = curry((count, current, msg) => {
  log(`\n${chalk`[${current}/${count}] {white ${msg} ...}`}`);
});
