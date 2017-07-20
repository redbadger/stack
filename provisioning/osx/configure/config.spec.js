import { expect } from 'chai';
import { flatten as flattenConfig } from './config';

describe('config', () => {
  it('should flatten the config', () => {
    const config = {
      domains: [
        {
          name: 'dev',
          stacks: [
            {
              name: 'services',
              services: [
                {
                  name: 'visualizer',
                },
              ],
            },
            {
              name: 'app',
              services: [
                {
                  name: 'rproxy',
                  aliases: ['web'],
                },
              ],
            },
          ],
        },
      ],
    };
    const expected = [
      {
        domain: 'dev',
        stack: 'services',
        name: 'visualizer',
        aliases: [],
      },
      {
        domain: 'dev',
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
      },
    ];
    const actual = flattenConfig(config);
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});
