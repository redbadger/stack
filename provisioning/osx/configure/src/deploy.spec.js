import assert from 'power-assert';
import { validate } from './deploy';

describe('deploy - parse and validate stack names', () => {
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
  it('when both valid', () => {
    const stacknames = 'app, services';
    const expected = {
      stacks: ['app', 'services'],
      messages: [],
    };
    const actual = validate(stacknames, stackconfig);
    assert.deepEqual(actual, expected);
  });
  it('when one valid and one invalid', () => {
    const stacknames = 'app, service';
    const expected = {
      stacks: ['app'],
      messages: ['The stack called "service" is not declared in the configuration'],
    };
    const actual = validate(stacknames, stackconfig);
    assert.deepEqual(actual, expected);
  });
  it('when neither valid', () => {
    const stacknames = 'app1, service';
    const expected = {
      stacks: [],
      messages: [
        'The stack called "app1" is not declared in the configuration',
        'The stack called "service" is not declared in the configuration',
      ],
    };
    const actual = validate(stacknames, stackconfig);
    assert.deepEqual(actual, expected);
  });
});
