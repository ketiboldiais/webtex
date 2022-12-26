import { nanoid } from "nanoid";

const makeId = (size: number) => {
  return nanoid(size);
};

export { makeId };
