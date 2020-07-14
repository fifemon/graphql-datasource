import { flatten, isRFC3339_ISO6801 } from './util';

test('flatten function test', () => {
  let obj = {
    string: 'hello',
    number: 123,
    float: 123.4,
    null: null,
    undefined: undefined,
    array: [1, 2, 3],
    nested: {
      string: 'hello',
      number: 123,
      float: 123.4,
      null: null,
      undefined: undefined,
    },
  };

  let flattenObj = {
    string: 'hello',
    number: 123,
    float: 123.4,
    null: null,
    undefined: undefined,
    'array.0': 1,
    'array.1': 2,
    'array.2': 3,
    'nested.string': 'hello',
    'nested.number': 123,
    'nested.float': 123.4,
    'nested.null': null,
    'nested.undefined': undefined,
  };

  expect(flatten(obj)).toEqual(flattenObj);
});

test('RFC3339 and ISO8601 valid string test', () => {
  expect(isRFC3339_ISO6801('I am not a date but a string')).toBe(false);
  expect(isRFC3339_ISO6801('1234')).toBe(false);
  expect(isRFC3339_ISO6801(8)).toBe(false);
  expect(isRFC3339_ISO6801(null)).toBe(false);
  expect(isRFC3339_ISO6801('2020-06-01T00:00:00.000Z')).toBe(true);
  expect(isRFC3339_ISO6801('2020-06-01T00:00:00Z')).toBe(true);
  expect(isRFC3339_ISO6801(true)).toBe(false);
  expect(isRFC3339_ISO6801(0)).toBe(false);
  expect(isRFC3339_ISO6801(0.111111)).toBe(false);
});
