import assert from 'power-assert';
import { validate } from './deploy';

describe.only('deploy - parse and validate stack names', () => {
  const stackconfig = {
    stacks: [
      {
        name: 'services',
        'compose-files': ['services.yml'],
        services: [{ name: 'visualizer', health: '/_health' }],
      },
      {
        name: 'app',
        'compose-files': ['app.yml'],
        services: [{ name: 'rproxy', health: '/status', aliases: ['web'] }],
      },
    ],
  };
  it('when all valid', () => {
    const stacknames = 'app, services';
    const expected = {
      stacks: ['app', 'services'],
      message: '',
    };
    const actual = validate(stacknames, stackconfig);
    assert(actual === expected);
  });
});
