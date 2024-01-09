import { randomString } from './random-string';

describe('randomString', () => {
  it('should generate a random string of default length 7', () => {
    const result = randomString();
    expect(result.length).toBe(7);
  });

  it('should generate a random string of specified length', () => {
    const length = 10;
    const result = randomString(length);
    expect(result.length).toBe(length);
  });

  it('should generate a random string with case sensitivity', () => {
    const result = randomString(5, { caseSensitive: true });
    expect(result).toMatch(/[A-Za-z0-9_]{5}/);
  });

  it('should generate a random string without case sensitivity', () => {
    const result = randomString(5, { caseSensitive: false });
    expect(result).toMatch(/[a-z0-9_]{5}/);
  });
});
