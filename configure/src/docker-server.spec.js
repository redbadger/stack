import assert from 'power-assert';

import { buildEnv } from './docker-server';

describe('docker-server', () => {
  it('should build the right env for local docker server', () => {
    const processEnv = {
      x: 1,
      DOCKER_TLS_VERIFY: 'x',
      DOCKER_HOST: 'x',
      DOCKER_CERT_PATH: 'x',
      DOCKER_MACHINE_NAME: 'x',
    };
    const dockerEnv = {
      DOCKER_TLS_VERIFY: null,
      DOCKER_HOST: null,
      DOCKER_CERT_PATH: null,
      DOCKER_MACHINE_NAME: null,
    };
    const expected = { x: 1 };
    const actual = buildEnv(processEnv, dockerEnv);
    assert.deepEqual(actual, expected);
  });
  it('should build the right env for remote docker server, when local', () => {
    const processEnv = {
      x: 1,
    };
    const dockerEnv = {
      DOCKER_TLS_VERIFY: 'x',
      DOCKER_HOST: 'x',
      DOCKER_CERT_PATH: 'x',
      DOCKER_MACHINE_NAME: 'x',
    };
    const expected = {
      x: 1,
      DOCKER_TLS_VERIFY: 'x',
      DOCKER_HOST: 'x',
      DOCKER_CERT_PATH: 'x',
      DOCKER_MACHINE_NAME: 'x',
    };
    const actual = buildEnv(processEnv, dockerEnv);
    assert.deepEqual(actual, expected);
  });
  it('should build the right env for remote docker server, when remote', () => {
    const processEnv = {
      x: 1,
      DOCKER_TLS_VERIFY: 'x',
      DOCKER_HOST: 'x',
      DOCKER_CERT_PATH: 'x',
      DOCKER_MACHINE_NAME: 'x',
    };
    const dockerEnv = {
      DOCKER_TLS_VERIFY: 'y',
      DOCKER_HOST: 'y',
      DOCKER_CERT_PATH: 'y',
      DOCKER_MACHINE_NAME: 'y',
    };
    const expected = {
      x: 1,
      DOCKER_TLS_VERIFY: 'y',
      DOCKER_HOST: 'y',
      DOCKER_CERT_PATH: 'y',
      DOCKER_MACHINE_NAME: 'y',
    };
    const actual = buildEnv(processEnv, dockerEnv);
    assert.deepEqual(actual, expected);
  });
});
