import { ReactNode } from "react";

export function toggle(a: string, b: string) {
  return {
    on(c: boolean) {
      return c ? a : b;
    },
  };
}

export function concat(...elements: (string | number)[]) {
  return elements.join(" ");
}

export function Iff(condition: boolean) {
  return {
    Then(component1: ReactNode) {
      return {
        Else(component2: ReactNode) {
          return condition ? component1 : component2;
        },
      };
    },
  };
}

export function Render(component: ReactNode) {
  return {
    OnlyIf(c: boolean|undefined) {
      if (c) return component;
      return <></>;
    },
  };
}
