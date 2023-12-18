import { camelCase, isArray, isObject, transform } from 'lodash';

type input = Record<string, any>;
type output = Record<string, any>;

export const mapToCamelCase = <T = output>(obj: input): T => {
  return transform(obj, (acc: Record<string, object>, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);

    acc[camelKey] = isObject(value) ? mapToCamelCase(value) : value;
  }) as unknown as T;
};
