export const log = txt => {
  process.stdout.write(`${txt}\n`);
};

export const err = txt => {
  process.stderr.write(`${txt}\n`);
};
