/**
 * Returns the date d` days from now.
 * @param days - The number of days.
 * @remark Returns `null` if `d` is not of type number.
 * @public
 */
export const DaysFromNow = (d: number) => {
  if (typeof d !== "number") {
    return null;
  }
  let future = new Date();
  future.setDate(future.getDate() + d);
  return future;
};
