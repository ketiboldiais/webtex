import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  CommandListenerPriority,
  LexicalCommand,
} from "lexical";
import { CommandListener } from "lexical/LexicalEditor";
import { ReactNode } from "react";

export function classToggle(a: string, b: string) {
  return {
    on(c: boolean) {
      return c ? a : b;
    },
  };
}

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
export const WELCOME_NOTE_CONTENT =
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Webtex is a note taking application geared towards technical subjects.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"We can do bulleted lists:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"numbered lists:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Ordered item 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Ordered item 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Ordered item 3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"number","start":1,"tag":"ol"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"and headings of different sizes:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h1"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h3"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 4","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h4"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 5","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h5"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading 6","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h6"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Familiar with LaTeX? Enter math-mode by entering a dollar sign, then terminate with another dollar sign: ","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Let ","type":"text","version":1},{"equation":"f","inline":true,"type":"equation","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" be a function in ","type":"text","version":1},{"equation":"\\\\reals","inline":true,"type":"equation","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", denoted ","type":"text","version":1},{"equation":"f: A \\\\to B","inline":true,"type":"equation","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", with ","type":"text","version":1},{"equation":"A \\\\subset \\\\reals","inline":true,"type":"equation","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" and ","type":"text","version":1},{"equation":"B \\\\subset \\\\reals","inline":true,"type":"equation","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":".","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

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
