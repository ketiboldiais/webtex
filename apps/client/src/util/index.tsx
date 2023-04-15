import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  CommandListenerPriority,
  LexicalCommand,
} from "lexical";
import { CommandListener, LexicalEditor } from "lexical/LexicalEditor";
import {
  Dispatch,
  MouseEvent,
  PointerEvent,
  ReactNode,
  SetStateAction,
} from "react";

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
export const WELCOME_NOTE_CONTENT = '{"root":{"children":[{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome","type":"text","version":1}],"direction":"ltr","format":"right","indent":0,"type":"heading","version":1,"tag":"h1"},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Webtex is a text-editor designed for rapid note-taking during technical lectures. Explore the toolbar above for some basic functions. ","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"The editor uses your browser\'s IndexedDB API for data persistence. For the unfamiliar, this is a database that your browser provides. By using something you already have, everything lives on your machine: only you can access your notes, as long as only you can access your machine.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"To create a new note, click the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Write ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"icon on the top-right corner. To its right is a trash bin icon. Deleted notes are stored in this bin. Webtex will not automatically clean your trash bin, but it will display a notification if it gets too large. Deleted notes can be recovered by clicking ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Recover","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":". The ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Destroy ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"action is irreversible. ","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Basic Formatting","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Standard text-formatting is supported through the toolbar buttons above—","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"bold, ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"italic","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", ","type":"text","version":1},{"detail":0,"format":8,"mode":"normal","style":"","text":"underline","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", ","type":"text","version":1},{"detail":0,"format":4,"mode":"normal","style":"","text":"strikethrough","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", and ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: small-caps;","text":"small-capitals. ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-size: 14px;","text":"Font-sizes","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":" are supported up to ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-size: 18px;","text":"70","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":" (measured in pixels). A set of ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-family: cursive;","text":"font-families","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":" are provided. Which font-families are available will depend on whether you\'re on ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-family: Andale Mono;","text":"Linux","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":", ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-family: fantasy;","text":"Windows","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":", or ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;font-family: Arial;","text":"Mac","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":" (for performance, the editor uses your system\'s fonts). Headings range from H1 through H6, (click on the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"font-variant: normal;","text":"Basic Formatting","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"font-variant: normal;","text":" heading above to see the block-format button change text). ","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"The editor supports other standard formatting. E.g., numbered lists:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Item 3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"number","start":1,"tag":"ol"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"bulleted lists:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bullet 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bullet 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bullet 3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"and quotes:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"“This one is from the book!” - Paul Erdös","type":"text","version":1}],"direction":"ltr","format":"start","indent":0,"type":"quote","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Latex Support","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Inline Latex expressions are rendered by an opening dollar sign (e.g., ","type":"text","version":1},{"latex":"3x^3 - 2x","inline":true,"type":"latex","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"), and block-level expressions with the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Equation","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" button under the toolbar\'s ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Figure","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" dropdown:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"latex":"\\\\begin{bmatrix}\\na & b & c \\\\\\\\\\nd & e & f \\\\\\\\\\ng & h & i\\n\\\\end{bmatrix}","inline":false,"type":"latex","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Images","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"The ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Figure ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"dropdown also contains an Image option to insert images via file-upload or link:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"altText":"","caption":{"editorState":{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}},"height":0,"maxWidth":500,"showCaption":false,"src":"https://upload.wikimedia.org/wikipedia/commons/e/e3/Hermitage_cat.jpeg","type":"image","version":1,"width":0}],"direction":null,"format":"center","indent":0,"type":"paragraph","version":1},{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Plotting 2D Functions","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"To plot two-dimensional functions, click the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Plot2D ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"option under the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Figure","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" dropdown. The function-plot module can render both integrals and Riemann sums:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"functions":[{"fn":"f(x) = x^2","id":"demo","domain":[-10,10],"range":[-10,10],"samples":170,"color":"#ff0000","riemann":{"domain":[-3,3],"dx":0.5,"method":"midpoint","color":"#ff0000"},"integrate":{"bounds":[null,null],"color":"#ff0000"}}],"samples":170,"domain":[-10,10],"range":[-10,10],"width":500,"height":500,"ticks":10,"type":"Plot2DNode","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Spreadsheets","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"The editor implements some basic spreadsheet functionality. To evaluate an arithmetic expression, begin the expression with an \'=\' sign (note that this document is rendered read-only by default to reduce memory consumption; to edit the table below, click ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Add Column ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"or ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Add Row","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" to trigger the event listeners). ","type":"text","version":1}],"direction":"ltr","format":"left","indent":0,"type":"paragraph","version":1},{"children":[{"rows":[{"cells":[{"value":"","type":"td","id":"wgsqn","column":"A","row":0},{"value":"","type":"td","id":"skqly","column":"B","row":0},{"value":"","type":"td","id":"wpesk","column":"C","row":0}],"id":"dyaor"},{"cells":[{"value":"","type":"td","id":"eghki","column":"A","row":1},{"value":"","type":"td","id":"rphvz","column":"B","row":1},{"value":"","type":"td","id":"kvkvb","column":"C","row":1}],"id":"fkqsu"},{"cells":[{"value":"","type":"td","id":"ndlyz","column":"A","row":2},{"value":"","type":"td","id":"tnkha","column":"B","row":2},{"value":"","type":"td","id":"jynev","column":"C","row":2}],"id":"jcdgr"},{"cells":[{"value":"","type":"td","id":"hhycl","column":"A","row":3},{"value":"","type":"td","id":"zengr","column":"B","row":3},{"value":"","type":"td","id":"jjlao","column":"C","row":3}],"id":"gekln"}],"minColCount":3,"minRowCount":3,"type":"spreadsheet","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Sketching","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"For arbitrary sketching/drawing, the editor\'s ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Draw ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"option under the ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"Figure ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"dropdown uses Excalidraw:","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"data":"[{\\"id\\":\\"nfGTWraKAswDJeQY-eVml\\",\\"type\\":\\"ellipse\\",\\"x\\":642.3675537109375,\\"y\\":176.50323486328125,\\"width\\":64.9189453125,\\"height\\":65.6976318359375,\\"angle\\":0,\\"strokeColor\\":\\"#000000\\",\\"backgroundColor\\":\\"transparent\\",\\"fillStyle\\":\\"hachure\\",\\"strokeWidth\\":1,\\"strokeStyle\\":\\"solid\\",\\"roughness\\":1,\\"opacity\\":100,\\"groupIds\\":[],\\"roundness\\":{\\"type\\":2},\\"seed\\":1533754340,\\"version\\":88,\\"versionNonce\\":997845476,\\"isDeleted\\":false,\\"boundElements\\":[{\\"id\\":\\"MucCW6VmPmGL7gU6J5aH0\\",\\"type\\":\\"arrow\\"}],\\"updated\\":1681524106730,\\"link\\":null,\\"locked\\":false},{\\"id\\":\\"MucCW6VmPmGL7gU6J5aH0\\",\\"type\\":\\"arrow\\",\\"x\\":693.5357055664062,\\"y\\":244.9345703125,\\"width\\":46.60809326171875,\\"height\\":123.00265502929688,\\"angle\\":0,\\"strokeColor\\":\\"#000000\\",\\"backgroundColor\\":\\"transparent\\",\\"fillStyle\\":\\"hachure\\",\\"strokeWidth\\":1,\\"strokeStyle\\":\\"solid\\",\\"roughness\\":1,\\"opacity\\":100,\\"groupIds\\":[],\\"roundness\\":{\\"type\\":2},\\"seed\\":386775644,\\"version\\":45,\\"versionNonce\\":1316467164,\\"isDeleted\\":false,\\"boundElements\\":null,\\"updated\\":1681524106730,\\"link\\":null,\\"locked\\":false,\\"points\\":[[0,0],[46.60809326171875,123.00265502929688]],\\"lastCommittedPoint\\":null,\\"startBinding\\":{\\"elementId\\":\\"nfGTWraKAswDJeQY-eVml\\",\\"focus\\":-0.15032069269132892,\\"gap\\":7.437522928847876},\\"endBinding\\":null,\\"startArrowhead\\":null,\\"endArrowhead\\":\\"arrow\\"},{\\"id\\":\\"4IyCIMlDz2tHnu85oz_iZ\\",\\"type\\":\\"ellipse\\",\\"x\\":730.0576171875,\\"y\\":354.5272521972656,\\"width\\":74.367919921875,\\"height\\":73.45950317382812,\\"angle\\":0,\\"strokeColor\\":\\"#000000\\",\\"backgroundColor\\":\\"transparent\\",\\"fillStyle\\":\\"hachure\\",\\"strokeWidth\\":1,\\"strokeStyle\\":\\"solid\\",\\"roughness\\":1,\\"opacity\\":100,\\"groupIds\\":[],\\"roundness\\":{\\"type\\":2},\\"seed\\":1530482276,\\"version\\":27,\\"versionNonce\\":1421266012,\\"isDeleted\\":false,\\"boundElements\\":[{\\"id\\":\\"tbiR2IMcQ2mMyFiyFRl4C\\",\\"type\\":\\"arrow\\"}],\\"updated\\":1681524096270,\\"link\\":null,\\"locked\\":false},{\\"id\\":\\"tbiR2IMcQ2mMyFiyFRl4C\\",\\"type\\":\\"arrow\\",\\"x\\":727.7939453125,\\"y\\":388.51239013671875,\\"width\\":196.35791015625,\\"height\\":47.211181640625,\\"angle\\":0,\\"strokeColor\\":\\"#000000\\",\\"backgroundColor\\":\\"transparent\\",\\"fillStyle\\":\\"hachure\\",\\"strokeWidth\\":1,\\"strokeStyle\\":\\"solid\\",\\"roughness\\":1,\\"opacity\\":100,\\"groupIds\\":[],\\"roundness\\":{\\"type\\":2},\\"seed\\":556706788,\\"version\\":36,\\"versionNonce\\":1066085092,\\"isDeleted\\":false,\\"boundElements\\":null,\\"updated\\":1681524097008,\\"link\\":null,\\"locked\\":false,\\"points\\":[[0,0],[-196.35791015625,-47.211181640625]],\\"lastCommittedPoint\\":null,\\"startBinding\\":{\\"elementId\\":\\"4IyCIMlDz2tHnu85oz_iZ\\",\\"focus\\":-0.17829537624301922,\\"gap\\":2.3612618263755607},\\"endBinding\\":null,\\"startArrowhead\\":null,\\"endArrowhead\\":\\"arrow\\"},{\\"id\\":\\"Zs3kvegMYv5it3YShCaGn\\",\\"type\\":\\"ellipse\\",\\"x\\":450.35662841796875,\\"y\\":294.63861083984375,\\"width\\":62.1895751953125,\\"height\\":63.65130615234375,\\"angle\\":0,\\"strokeColor\\":\\"#000000\\",\\"backgroundColor\\":\\"transparent\\",\\"fillStyle\\":\\"hachure\\",\\"strokeWidth\\":1,\\"strokeStyle\\":\\"solid\\",\\"roughness\\":1,\\"opacity\\":100,\\"groupIds\\":[],\\"roundness\\":{\\"type\\":2},\\"seed\\":1770936412,\\"version\\":61,\\"versionNonce\\":373761124,\\"isDeleted\\":false,\\"boundElements\\":null,\\"updated\\":1681524093044,\\"link\\":null,\\"locked\\":false}]","type":"excalidraw","version":1}],"direction":null,"format":"center","indent":0,"type":"paragraph","version":1},{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

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

export enum KEYCODE {
  SHIFT = 16,
  ESC = 27,
  TAB = 9,
  ARROW_LEFT = 37,
  ARROW_UP = 38,
  ARROW_RIGHT = 39,
  ARROW_DOWN = 40,
  BACKSPACE = 8,
  DELETE = 46,
  ENTER = 13,
  C_KEY = 67,
  X_KEY = 88,
  V_KEY = 86,
}

export type KeyName =
  | "Shift"
  | "Escape"
  | "Tab"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "Backspace"
  | "Enter"
  | "Delete";

export type KBCom = LexicalCommand<KeyboardEvent | ClipboardEvent>;
export type StateSetter<T> = Dispatch<SetStateAction<T>>;
export type Html = HTMLElement;

export type Children = { children?: ReactNode };

export type EditorPrompt = {
  activeEditor: LexicalEditor;
  onClose: () => void;
};
