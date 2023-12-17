import { camelCase, isArray, isObject, transform } from 'lodash-es';

export const mapToCamelCase = <T = Record<string, unknown>>(obj: object): T => {
  return transform(obj, (acc: Record<string, object>, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);

    acc[camelKey] = isObject(value) ? mapToCamelCase(value) : value;
  }) as unknown as T;
};
