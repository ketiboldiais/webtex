import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  CommandListenerPriority,
  LexicalCommand,
} from "lexical";
import { CommandListener } from "lexical/LexicalEditor";
import { MouseEvent, PointerEvent, ReactNode } from "react";

export function joinRest(...classes: (string | undefined)[]) {
  return {
    on(c: boolean) {
      return c
        ? classes.map((v) => v === undefined ? "" : v).join(" ")
        : classes[0] ?? "";
    },
  };
}

export function toggle(a: string = "", b: string = "") {
  return {
    on(c: boolean) {
      return c ? a : b;
    },
  };
}


export const strung = (
  elements: (string | number | undefined)[],
  separator: string = " ",
) => {
  const strings = elements.map((str) => str === undefined ? "" : `${str}`);
  return {
    on: (condition: boolean) => condition ? strings.join(separator) : "",
    all: () => strings.join(separator),
    tailIf: (condition: boolean) =>
      condition ? strings.join(separator) : strings[0],
    headIf: (condition: boolean) =>
      condition ? strings[0] : strings.slice(1).join(separator),
  };
};



export function concat(...elements: (string | number | undefined)[]) {
  return elements.map((s) => s === undefined ? "" : s).join(" ");
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
    OnlyIf(c: boolean | undefined) {
      if (c) return component;
      return <></>;
    },
  };
}

export const DEFAULT_NOTE_CONTENT =
  `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;
export const EMPTY_NOTE =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
export const WELCOME_NOTE_CONTENT = DEFAULT_NOTE_CONTENT;

export const DOM_AVAILABLE = typeof window !== "undefined" &&
  typeof window.document !== undefined &&
  typeof window.document.createElement !== undefined;

export const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export type RegisterTriple<t> = [
  LexicalCommand<t>,
  CommandListener<t>,
  CommandListenerPriority,
];

export const command = {
  priority: {
    low<t>(
      x: LexicalCommand<t>,
      listener: CommandListener<t>,
    ): RegisterTriple<t> {
      return [
        x,
        listener,
        COMMAND_PRIORITY_LOW,
      ];
    },
    editor<t>(
      x: LexicalCommand<t>,
      listener: CommandListener<t>,
    ): RegisterTriple<t> {
      return [
        x,
        listener,
        COMMAND_PRIORITY_EDITOR,
      ];
    },
    high<t>(
      x: LexicalCommand<t>,
      listener: CommandListener<t>,
    ): RegisterTriple<t> {
      return [
        x,
        listener,
        COMMAND_PRIORITY_HIGH,
      ];
    },
    critical<t>(
      x: LexicalCommand<t>,
      listener: CommandListener<t>,
    ): RegisterTriple<t> {
      return [
        x,
        listener,
        COMMAND_PRIORITY_CRITICAL,
      ];
    },
  },
};

export const Cache = {
  cell: {
    html: new Map<string, string>(),
    textContent: new Map<string, string>(),
  },
};

export const plainTxtEditor = (text: string) =>
  text === ""
    ? DEFAULT_NOTE_CONTENT
    : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":${text},"type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export const dne = (x: any): x is undefined =>
  x === undefined || typeof x === "undefined";
export const nil = (x: any): x is null => x === null;

export const isExistent = (x: any) => (!dne(x)) && !nil(x);
export const empty = (x: any) => x && x.length && x.length === 0;

export const IS_APPLE = DOM_AVAILABLE &&
  /Mac|iPod|iPhone/.test(navigator.platform);

export const editorNode = {
  type: {
    table: "tablesheet",
  },
} as const;

export type DIVPtr = PointerEvent<HTMLDivElement>;
export type DIVClk = MouseEvent<HTMLDivElement>;

export const emptyEditorJSON =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export const plainTextJSON = (text: string) =>
  text === ""
    ? emptyEditorJSON
    : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":${text},"type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;
