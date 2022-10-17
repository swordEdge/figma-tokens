import { checkIfAlias } from '../checkIfAlias';

describe('checkIfAlias', () => {
  const correctTokens = [
    {
      name: 'objectString',
      value: '$colors.foo',
    },
    {
      name: 'string',
      value: '$colors.foo',
    },
    {
      name: 'zero',
      value: '$colors.zero',
    },
    {
      name: 'nonexistant',
      value: '$colors.nonexistant',
    },
    {
      name: 'composition-token',
      type: 'composition',
      value: {
        property: 'opacity',
        value: 'opacity.40',
      },
    },
  ];
  const incorrectTokens = [
    { name: 'string', value: 'foo' },
    {
      name: 'number',
      value: 3,
    },
    {
      name: 'zero',
      value: 0,
    },
    {
      name: 'array',
      value: [0, 1, 2, 3],
    },
  ];
  const allTokens = [
    {
      name: 'colors.foo',
      value: 'red',
    },
    {
      name: 'colors.zero',
      value: 0,
    },
  ];

  // @TODO check typing
  describe('correct tokens', () => {
    correctTokens.forEach((token) => {
      it(`token ${token.name}`, () => {
        expect(checkIfAlias(token, allTokens)).toBe(true);
      });
    });
  });

  describe('incorrect tokens', () => {
    incorrectTokens.forEach((token) => {
      it(`token ${token.name}`, () => {
        expect(checkIfAlias(token, allTokens)).toBe(false);
      });
    });
  });
});
