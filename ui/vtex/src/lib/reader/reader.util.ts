import { CSTR } from "../core/core.utils";

function UsingMetadata<CLASS extends CSTR, T>(C: CLASS) {
  return class extends C {
    metadata?: T;
    meta(data: T) {
      this.metadata = data;
      return this;
    }
  };
}