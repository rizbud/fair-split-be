import { randomString } from '..';

interface Options {
  maxLength?: number;
  randomStringLength?: number;
}

export const toSlug = (str: string, options?: Options) => {
  const { maxLength = 32, randomStringLength = 7 } = options || {};

  const slicedLength = maxLength - randomStringLength - 1;
  const dasherized = str
    .trim()
    .replace(/[^a-z0-9-\s]/gi, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with one space
    .slice(0, slicedLength)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-'); // Replace spaces with dash

  return dasherized + '-' + randomString(randomStringLength);
};
