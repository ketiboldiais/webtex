import {nanoid} from "nanoid";

/** Generates a unique identifier for the cells. */
function uid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
}

export type CellType = "td" | "th";

export type Cell = {
  value: string;
  type: CellType;
  id: string;
};

function newCell(type: CellType, value = ""): Cell {
  return ({
    value,
    type,
    id: nanoid(4),
  });
}

export type Row = {
  cells: Cell[];
  id: string;
};
function newRow(cells: Cell[] = []) {
  return ({
    cells,
    id: uid(),
  });
}

function makeCells(count: number, type: CellType = "td") {
  const cells: Cell[] = [];
  for (let i = 0; i < count; i++) {
    const cell = newCell(type);
    cells.push(cell);
  }
  return cells;
}

function cloneCells(cells: Cell[]) {
  return Array.from(cells);
}

function cloneRow(row: Row, variance: Partial<Row> = {}) {
  return ({
    ...row,
    ...variance,
  });
}

export type Rows = Row[];

export function makeRows(
  rowCount: number,
  colCount: number,
  type: "td" | "th" = "td",
) {
  const rows: Rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(newRow(makeCells(colCount, type)));
  }
  return rows;
}

export type CellMap = Record<string, [number, number]>;

export class Spreadsheet {
  __rowCount: number;
  __colCount: number;
  __lastUpdatedCellID: string = "";
  __addressMap: CellMap = {};
  __rows: Rows;

  constructor(rows: Rows) {
    this.__rows = rows;
    this.__rowCount = rows.length;
    this.__colCount = rows[0].cells.length;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const cells = row.cells;
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        this.__addressMap[cell.id] = [r, c];
      }
    }
  }
  
  static preload(rows: Rows) {
    return new Spreadsheet(rows);
  }

  get rows() {
    const self = this.getWritable();
    return self.__rows;
  }
  
  get lastUpdatedCellID() {
    return this.__lastUpdatedCellID;
  }

  getWritable() {
    return this;
  }

  updateMap(id: string, row: number, col: number) {
    const self = this.getWritable();
    self.__addressMap[id] = [row, col];
  }

  deleteCellPos(id: string) {
    const self = this.getWritable();
    if (self.__addressMap[id]) {
      delete self.__addressMap[id];
    }
  }

  pushRow(type: CellType = "td") {
    const self = this.getWritable();
    const rows = self.__rows;
    const R = rows.length;
    const cells: Cell[] = [];
    for (let c = 0; c < self.__colCount; c++) {
      const cell = newCell(type);
      self.updateMap(cell.id, R, c);
      cells.push(cell);
    }
    self.__rowCount++;
    rows.push(newRow(cells));
  }

  addRows(count: number) {
    const self = this.getWritable();
    for (let i = 0; i < count; i++) {
      self.pushRow();
    }
  }

  addColumns(count: number) {
    const self = this.getWritable();
    for (let i = 0; i < count; i++) {
      self.pushCol();
    }
  }

  popRow() {
    const self = this.getWritable();
    const rows = self.__rows;
    const row = rows.pop();
    if (row) {
      for (const key in self.__addressMap) {
        const [row] = self.__addressMap[key];
        if (row === self.__rowCount - 1) {
          delete self.__addressMap[key];
        }
      }
    }
    self.__rowCount--;
  }

  pushCol() {
    const self = this.getWritable();
    const rows = self.__rows;
    const C = self.__colCount;
    const R = self.__rowCount;
    for (let r = 0; r < R; r++) {
      const row = rows[r];
      const cells = row.cells;
      const type = cells[cells.length - 1].type;
      const cell = newCell(type);
      self.updateMap(cell.id, C, r);
      row.cells.push(cell);
    }
    self.__colCount++;
  }

  popCol() {
    const self = this.getWritable();
    const rows = self.__rows;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = cloneCells(row.cells);
      const rowClone = cloneRow(row, { cells });
      const deleted = cells.pop();
      if (deleted) self.deleteCellPos(deleted.id);
      rows[y] = rowClone;
    }
    self.__colCount--;
  }

  insertCol(x: number) {
    const self = this.getWritable();
    const rows = self.__rows;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = cloneCells(row.cells);
      const rowClone = cloneRow(row, { cells });
      const type = (cells[x] || cells[x - 1])?.type || "td";
      const newcell = newCell(type);
      cells.splice(x, 0, newcell);
      self.updateMap(newcell.id, y, x);
      rows[y] = rowClone;
    }
    self.__colCount++;
  }

  static sized(rowcount: number, colcount: number) {
    return new Spreadsheet(makeRows(rowcount, colcount));
  }

  getCell(rowIndex: number, columnIndex: number): null | Cell {
    const self = this.getWritable();
    if ((self.__rows[rowIndex]) === undefined) return null;
    const cells = self.rows[rowIndex].cells;
    if ((cells[columnIndex]) === undefined) return null;
    return cells[columnIndex];
  }

  updateCellValue(rowIndex: number, columnIndex: number, updateValue: string) {
    const self = this.getWritable();
    const cell = self.getCell(rowIndex, columnIndex);
    if (cell === null) return;
    cell.value = updateValue;
    self.__lastUpdatedCellID = cell.id;
  }
}
