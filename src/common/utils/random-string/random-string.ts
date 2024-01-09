type RandomString = (
  length?: number,
  options?: { caseSensitive?: boolean },
) => string;

export const randomString: RandomString = (length = 7, options) => {
  const { caseSensitive = true } = options || {};

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const character = characters.charAt(randomIndex);

    result += character;
  }

  return caseSensitive ? result : result.toLowerCase();
};
