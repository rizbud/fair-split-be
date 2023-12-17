import { isArray, isObject, snakeCase, transform } from 'lodash-es';

export const mapToSnakeCase = (input: object): object => {
  return transform(input, (acc: Record<string, object>, value, key, target) => {
    const snakeKey = isArray(target) ? key : snakeCase(key);

    acc[snakeKey] = isObject(value) ? mapToSnakeCase(value) : value;
  });
};
