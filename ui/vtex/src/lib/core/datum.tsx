import { ReactNode } from "react";

export class Datum {
  Label: ReactNode = "";
  constructor() {}
  label(text: ReactNode) {
    this.Label = text;
    return this;
  }
}
