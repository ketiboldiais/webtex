import { nanoid } from "nanoid";

export const makeID = (size: number) => {
  const id = nanoid(size);
  return id;
};
