/**
 * Returns `true` if the character
 * argument is a letter, false otherwise.
 */
export const isAlpha = (char: number) => {
  return (97 <= char && char <= 122) || (65 <= char && char <= 90);
};
