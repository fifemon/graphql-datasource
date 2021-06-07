import { GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';
import { Schema } from './schema';

test('getTypeOfDescendant', () => {
  const childType = new GraphQLObjectType({
    name: 'child-type',
    fields: {
      grandchild1: { type: GraphQLInt },
      grandchild2: { type: GraphQLFloat },
    },
  });
  const parentType = new GraphQLObjectType({
    name: 'parent-type',
    fields: {
      child1: { type: GraphQLString },
      child2: {
        type: childType,
      },
    },
  });

  expect(Schema.getTypeOfDescendant(parentType, 'child1')).toBe(GraphQLString);
  expect(Schema.getTypeOfDescendant(parentType, 'child2')).toBe(childType);
  expect(Schema.getTypeOfDescendant(parentType, 'child2.grandchild1')).toBe(GraphQLInt);
  expect(Schema.getTypeOfDescendant(parentType, 'child2.grandchild2')).toBe(GraphQLFloat);
  expect(Schema.getTypeOfDescendant(childType, 'grandchild1')).toBe(GraphQLInt);
});

describe('isNumericType', () => {
  test('object', () => {
    const type = new GraphQLObjectType({ name: 'Address', fields: { street: { type: GraphQLString } } });
    expect(Schema.isNumericType(type)).not.toBeTruthy();
  });

  test('string', () => {
    expect(Schema.isNumericType(GraphQLString)).not.toBeTruthy();
  });

  test('int', () => {
    expect(Schema.isNumericType(GraphQLInt)).toBeTruthy();
  });

  test('float', () => {
    expect(Schema.isNumericType(GraphQLFloat)).toBeTruthy();
  });
});
