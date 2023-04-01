import {
  createCommand,
  DecoratorNode,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { lazy, Suspense } from "react";
import { schema } from "../EditorConfig.js";
import { Rows } from "./sheet.aux.js";

const Sheet = lazy(() => import("./sheet.chip.js"));

type SerialBase = {
  rows: Rows;
  type: "spreadsheet";
  version: typeof schema["version"];
  key?: NodeKey;
};

type SpreadsheetNodeType = "spreadsheet";

export type SerializedSpreadsheetNode = Spread<
  SerialBase,
  SerializedLexicalNode
>;

export class SpreadsheetNode extends DecoratorNode<JSX.Element> {
  __rows: Rows;

  static getType(): SpreadsheetNodeType {
    return "spreadsheet";
  }

  static clone(node: SpreadsheetNode) {
    const rows = node.__rows;
    const key = node.__key;
    return new SpreadsheetNode(rows, key);
  }

  static importJSON(
    serializedNode: SerializedSpreadsheetNode,
  ): SpreadsheetNode {
    const rows = serializedNode.rows;
    const key = serializedNode.key;
    return new SpreadsheetNode(rows, key);
  }

  exportJSON(): SerializedSpreadsheetNode {
    const rows = this.__rows;
    const key = this.__key;
    return {
      rows,
      type: "spreadsheet",
      version: schema.version,
      key,
    };
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  constructor(rows: Rows, key?: NodeKey) {
    super(key);
    this.__rows = rows;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <Sheet rows={this.__rows} nodeKey={this.__key} />
      </Suspense>
    );
  }
}

export function $isSpreadsheetNode(
  node?: LexicalNode | null,
): node is SpreadsheetNode {
  return node instanceof SpreadsheetNode;
}

export function $createSpreadsheetNode(
  rows: Rows,
  key?: NodeKey,
): SpreadsheetNode {
  return new SpreadsheetNode(rows, key);
}

export type SpreadsheetPayload = Readonly<{ rows: Rows }>;

export const INSERT_SHEET_COMMAND: LexicalCommand<SpreadsheetPayload> =
  createCommand("INSERT_SHEET_COMMAND");
