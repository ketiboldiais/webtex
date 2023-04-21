import { ReactNode } from "react";

export class Datum {
  Label: ReactNode = "";
  constructor() {}
  label(text: ReactNode) {
    this.Label = text;
    return this;
  }
}

export abstract class Struct<t> {
  private _type: string;
  constructor(type:string) {
    this._type=type;
  }
  get type() {
    return this._type;
  }
  abstract get traits(): t
}

export type Pair<t> = [t,t];
export type Triple<t> = [t,t,t];
export type Quad<t> = [t,t,t,t];