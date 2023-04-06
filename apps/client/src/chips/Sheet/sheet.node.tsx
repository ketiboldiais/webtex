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
import { emptyEditorJSON, plainTextJSON } from "src/util/index.js";
import { schema } from "../EditorConfig.js";
import {
  Cell,
  CellType,
  cloneCell,
  cloneCells,
  cloneRow,
  htmlCache,
  newCell,
  newRow,
  Rows,
} from "./sheet.aux.js";
const Sheet = lazy(() => import("./sheet.component.js"));

type Base = {
  rows: Rows;
  type: "spreadsheet";
  version: typeof schema["version"];
};
export type SerializedSpreadsheetNode = Spread<Base, SerializedLexicalNode>;
type SpreadsheetNodeType = "spreadsheet";

export class SpreadsheetNode extends DecoratorNode<JSX.Element> {
  __rows: Rows;

  static getType(): SpreadsheetNodeType {
    return "spreadsheet";
  }

  static clone(node: SpreadsheetNode) {
    const rows = node.__rows;
    const key = node.__key;
    return new SpreadsheetNode(Array.from(rows), key);
  }

  static importJSON(node: SerializedSpreadsheetNode): SpreadsheetNode {
    const rows = node.rows;
    return $createSpreadsheetNode(rows);
  }

  exportJSON(): SerializedSpreadsheetNode {
    const rows = this.__rows;
    return {
      rows,
      type: "spreadsheet",
      version: schema.version,
    };
  }

  static importDOM() {
    return {
      table: () => ({
        conversion: convertTableElement,
        priority: 0,
      }),
    };
  }

  exportDOM() {
    return { element: exportTableCellsToHTML(this.__rows) };
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement("div");
    return div;
  }

  updateDOM(): false {
    return false;
  }

  constructor(rows: Rows, key?: NodeKey) {
    super(key);
    this.__rows = rows || [];
  }

  updateCellValue(rowIndex: number, columnIndex: number, value: string) {
    const self = this.getWritable();
    const rows = self.__rows;
    const row = rows[rowIndex];
    const cells = row.cells;
    const cell = cells[columnIndex];
    const clonedCells = Array.from(cells);
    const cellClone = {...cell, value};
    const rowClone = {...row, cells: clonedCells};
    clonedCells[columnIndex] = cellClone;
    rows[rowIndex] = rowClone;
  }

  toggleCellType(rowIndex: number, columnIndex: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const row = rows[rowIndex];
    const cells = row.cells;
    const cell = cells[columnIndex];
    const type: CellType = cell.type === "td" ? "th" : "td";
    const clonedCells = cloneCells(cells);
    const cellClone = cloneCell(cell, { type });
    const rowClone = cloneRow(row, { cells: clonedCells });
    clonedCells[columnIndex] = cellClone;
    rows[rowIndex] = rowClone;
  }

  insertColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const R = rows.length;
    for (let rowIndex = 0; rowIndex < R; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.cells;
      const clonedCells = cloneCells(cells);
      const rowClone = cloneRow(row, { cells: clonedCells });
      const type = (cells[columnIndex] || cells[columnIndex - 1]).type;
      clonedCells.splice(columnIndex, 0, newCell(type));
      rows[rowIndex] = rowClone;
    }
  }

  deleteColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const R = rows.length;
    for (let rowIndex = 0; rowIndex < R; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.cells;
      const clonedCells = cloneCells(cells);
      const rowClone = cloneRow(row, { cells: clonedCells });
      clonedCells.splice(columnIndex, 1);
      rows[rowIndex] = rowClone;
    }
  }

  addColumns(count: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const R = rows.length;
    for (let rowIndex = 0; rowIndex < R; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.cells;
      const clonedCells = cloneCells(cells);
      const rowClone = cloneRow(row, { cells: clonedCells });
      const type = cells[cells.length - 1].type;
      for (let x = 0; x < count; x++) {
        clonedCells.push(newCell(type));
      }
      rows[rowIndex] = rowClone;
    }
  }

  insertRowAt(rowIndex: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const previousRow = rows[rowIndex] || rows[rowIndex - 1];
    const cellCount = previousRow.cells.length;
    const row = newRow();
    for (let columnIndex = 0; columnIndex < cellCount; columnIndex++) {
      const cell = newCell(previousRow.cells[columnIndex].type);
      row.cells.push(cell);
    }
    rows.splice(rowIndex, 0, row);
  }

  deleteRowAt(rowIndex: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    rows.splice(rowIndex, 1);
  }

  addRows(count: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const previousRow = rows[rows.length - 1];
    const cellCount = previousRow.cells.length;
    for (let rowIndex = 0; rowIndex < count; rowIndex++) {
      const row = newRow();
      for (let colIndex = 0; colIndex < cellCount; colIndex++) {
        const cell = newCell(previousRow.cells[colIndex].type);
        row.cells.push(cell);
      }
      rows.push(row);
    }
  }

  updateColumnWidth(columnIndex: number, width: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    const R = rows.length;
    for (let rowIndex = 0; rowIndex < R; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.cells;
      const clonedCells = cloneCells(cells);
      const rowClone = cloneRow(row, { cells: clonedCells });
      clonedCells[columnIndex].width = width;
      rows[rowIndex] = rowClone;
    }
  }

  mergeRows(startX: number, startY: number, mergingRows: Rows) {
    const self = this.getWritable();
    const rows = self.__rows;
    const endY = Math.min(rows.length, startY + mergingRows.length);
    for (let y = startY; y < endY; y++) {
      const row = rows[y];
      const mergeRow = mergingRows[y - startY];
      const cells = row.cells;
      const clonedCells = cloneCells(cells);
      const rowClone = cloneRow(row, { cells: clonedCells });
      const mergeCells = mergeRow.cells;
      const endX = Math.min(cells.length, startX + mergeCells.length);
      for (let x = startX; x < endX; x++) {
        const cell = cells[x];
        const mergeCell = mergeCells[x - startX];
        const value = mergeCell.value;
        const type = mergeCell.type;
        const cellClone = cloneCell(cell, { value, type });
        clonedCells[x] = cellClone;
      }
      rows[y] = rowClone;
    }
  }

  isInline(): false {
    return false;
  }

  decorate(_: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <Suspense fallback={null}>
        <Sheet
          rows={this.__rows}
          theme={config.theme}
          nodeKey={this.__key}
        />
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
): SpreadsheetNode {
  return new SpreadsheetNode(rows);
}

export type SpreadsheetPayload = Readonly<{ rows: Rows }>;

export const INSERT_SHEET_COMMAND: LexicalCommand<SpreadsheetPayload> =
  createCommand("INSERT_SHEET_COMMAND");

function convertTableElement(domNode: HTMLElement) {
  const rowElems = domNode.querySelectorAll("tr");
  if (!rowElems || rowElems.length === 0) return null;
  const rows: Rows = [];
  for (let y = 0; y < rowElems.length; y++) {
    const rowElem = rowElems[y];
    const cellElems = rowElem.querySelectorAll("td,th");
    if (!cellElems || cellElems.length === 0) continue;
    const cells: Cell[] = [];
    for (let x = 0; x < cellElems.length; x++) {
      const cellElem = cellElems[x] as HTMLElement;
      const isHeader = cellElem.nodeName === "TH";
      const cell = newCell(isHeader ? "th" : "td");
      const content = JSON.stringify(cellElem.innerText.replace(/\n/g, " "));
      cell.value = plainTextJSON(content);
      cells.push(cell);
    }
    const row = newRow(cells);
    rows.push(row);
  }
  return { node: $createSpreadsheetNode(rows) };
}

export function exportTableCellsToHTML(
  rows: Rows,
  rect?: { startX: number; endX: number; startY: number; endY: number },
): HTMLElement {
  const table = document.createElement("table");
  const colGroup = document.createElement("colgroup");
  const tBody = document.createElement("tbody");
  const firstRow = rows[0];

  for (
    let x = rect != null ? rect.startX : 0;
    x < (rect != null ? rect.endX + 1 : firstRow.cells.length);
    x++
  ) {
    const col = document.createElement("col");
    colGroup.append(col);
  }

  for (
    let y = rect != null ? rect.startY : 0;
    y < (rect != null ? rect.endY + 1 : rows.length);
    y++
  ) {
    const row = rows[y];
    const cells = row.cells;
    const rowElem = document.createElement("tr");

    for (
      let x = rect != null ? rect.startX : 0;
      x < (rect != null ? rect.endX + 1 : cells.length);
      x++
    ) {
      const cell = cells[x];
      const cellElem = document.createElement(cell.type);
      cellElem.innerHTML = htmlCache.get(cell.value) || "";
      rowElem.appendChild(cellElem);
    }
    tBody.appendChild(rowElem);
  }

  table.appendChild(colGroup);
  table.appendChild(tBody);
  return table;
}

const plainTextEditorJSON = (text: string) =>
  text === ""
    ? emptyEditorJSON
    : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":${text},"type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export function extractRowsFromHTML(tableElem: HTMLTableElement): Rows {
  const rowElems = tableElem.querySelectorAll("tr");
  const rows: Rows = [];
  for (let y = 0; y < rowElems.length; y++) {
    const rowElem = rowElems[y];
    const cellElems = rowElem.querySelectorAll("td,th");
    if (!cellElems || cellElems.length === 0) {
      continue;
    }
    const cells: Array<Cell> = [];
    for (let x = 0; x < cellElems.length; x++) {
      const cellElem = cellElems[x] as HTMLElement;
      const isHeader = cellElem.nodeName === "TH";
      const cell = newCell(isHeader ? "th" : "td");
      cell.value = plainTextEditorJSON(
        JSON.stringify(cellElem.innerText.replace(/\n/g, " ")),
      );
      cells.push(cell);
    }
    const row = newRow(cells);
    rows.push(row);
  }
  return rows;
}
