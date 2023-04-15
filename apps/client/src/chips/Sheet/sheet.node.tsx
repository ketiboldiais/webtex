import {
  createCommand,
  DecoratorNode,
  EditorConfig,
  LexicalCommand,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { Rows } from "./sheet.type";
import { lazy, Suspense } from "react";

const Sheet = lazy(() => import("./sheet.chip.js"));

type SerialBase = {
  rows: Rows;
  minColCount: number;
  minRowCount: number;
  type: "spreadsheet";
  version: 1;
};

type SerializedSheetNode = Spread<SerialBase, SerializedLexicalNode>;

export class SheetNode extends DecoratorNode<JSX.Element> {
  __rows: Rows;
  __minColCount: number;
  __minRowCount: number;

  static clone(node: SheetNode) {
    return new SheetNode(
      node.__rows,
      node.__minColCount,
      node.__minRowCount,
      node.__key,
    );
  }

  static getType(): "spreadsheet" {
    return "spreadsheet";
  }

  static importJSON(snode: SerializedSheetNode) {
    const { rows, minColCount, minRowCount } = snode;
    return new SheetNode(rows, minColCount, minRowCount);
  }

  exportJSON(): SerializedSheetNode {
    return {
      rows: this.__rows,
      minColCount: this.__minColCount,
      minRowCount: this.__minRowCount,
      type: "spreadsheet",
      version: 1,
    };
  }
  
  updateDOM(): false {
    return false;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = 'contents';
    return div;
  }

  constructor(
    rows: Rows,
    minColCount: number,
    minRowCount: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__minColCount = minColCount;
    this.__minRowCount = minRowCount;
    this.__rows = rows;
  }

  decorate() {
    return (
      <Suspense>
        <Sheet
          minColCount={this.__minColCount}
          minRowCount={this.__minRowCount}
          initialRows={this.__rows}
        />
      </Suspense>
    );
  }
}

type SheetNodePayload = {
  minColCount: number;
  minRowCount: number;
  rows: Rows;
};

export const INSERT_SHEET_COMMAND: LexicalCommand<SheetNodePayload> =
  createCommand(
    "INSERT_SHEET_COMMAND",
  );

export function $createSheetNode({
  minColCount,
  minRowCount,
  rows,
}: SheetNodePayload) {
  return new SheetNode(rows, minColCount, minRowCount);
}

export function $isSheetNode(node:any): node is SheetNode {
  return node instanceof SheetNode;
}