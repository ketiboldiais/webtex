/**
 * Takes a JSON-stringified date and
 * returns a JavaScript `Date` object.
 * If the string value does not match
 * ISO format, returns `null`.
 */
export const ParseJsonDate = (date: string) => {
  const isoRegex =
    /(\d{4})-(\d{2})-(\d{2})T((\d{2}):(\d{2}):(\d{2}))\.(\d{3})Z/;
  if (typeof date !== "string") {
    return null;
  }
  const match = isoRegex.exec(date);
  if (match) {
    return new Date(JSON.parse(date));
  }
  return null;
};
