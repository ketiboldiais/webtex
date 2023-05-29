import { RVal } from "./typings.js";

export class Retval extends Error {
  value: RVal;
  constructor(value: RVal) {
    super(undefined, undefined);
    this.value = value;
  }
}
