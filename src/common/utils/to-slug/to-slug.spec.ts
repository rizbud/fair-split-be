import { toSlug } from './to-slug';

jest.mock('../random-string/random-string', () => ({
  randomString: jest.fn().mockReturnValue('ABCxyz1'),
}));

describe('toSlug', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return a slug', () => {
    expect(toSlug('Hello World')).toBe('hello-world-ABCxyz1');
  });

  it('should return a slug when has numbers', () => {
    expect(toSlug('Hello World 123')).toBe('hello-world-123-ABCxyz1');
  });

  it('should return a slug when length is > 32', () => {
    expect(toSlug('Hello World Hello World Hello World Hello World')).toBe(
      'hello-world-hello-world-ABCxyz1',
    );
  });

  it('should return a slug when has special characters', () => {
    expect(toSlug('Hello World!')).toBe('hello-world-ABCxyz1');
  });

  it('should return a slug when has special characters and dash', () => {
    expect(toSlug('Hello-World!')).toBe('hello-world-ABCxyz1');
  });
});
