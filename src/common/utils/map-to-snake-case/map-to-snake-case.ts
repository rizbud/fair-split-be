import { isArray, isObject, snakeCase, transform } from 'lodash';

type input = Record<string, any>;
type output = Record<string, any>;

export const mapToSnakeCase = <T = output>(input: input): T => {
  return transform(input, (acc: Record<string, object>, value, key, target) => {
    const snakeKey = isArray(target) ? key : snakeCase(key);

    acc[snakeKey] = isObject(value) ? mapToSnakeCase(value) : value;
  }) as unknown as T;
};
