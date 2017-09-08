import assert from 'power-assert';
import { validate, deploy } from './deploy';

describe('deploy', () => {
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
  describe('parse and validate stack names', () => {
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
  it('calls deployment correctly', async () => {
    const stacks = ['app', 'services'];
    const actual = [];
    const deployFn = (mgr, cmd, args) => {
      actual.push({ mgr, cmd, args });
    };
    await deploy(deployFn, 'mgr1', stacks);
    const expected = [
      {
        mgr: 'mgr1',
        cmd: 'docker',
        args: [
          'stack',
          'deploy',
          '--compose-file',
          'deploy-app.yml',
          '--with-registry-auth',
          'app',
        ],
      },
      {
        mgr: 'mgr1',
        cmd: 'docker',
        args: [
          'stack',
          'deploy',
          '--compose-file',
          'deploy-services.yml',
          '--with-registry-auth',
          'services',
        ],
      },
    ];
    assert.deepEqual(actual, expected);
  });
});
