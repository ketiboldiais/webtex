import {
  Button,
  Optional,
  OptionsList,
  Palette,
  Range,
  Switch,
  TextInput,
} from "../Inputs";
import {
  createContext,
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { evaluate, getRowCol, latinize, range, uid } from "@webtex/algom";
import { Children, Html } from "src/util";
import css from "../../ui/styles/App.module.scss";
import { Dropdown, Option } from "../Dropdown";
import { Chevron } from "../Icon";
import { InputFn, Pair } from "src/App";
import GRAPH, { GraphNode, Link } from "../Graph/graph.chip";
import { Interval, NumberInput } from "../Inputs";
import { Detail } from "../Detail";
import Plot2D, {
  BasePlotFn,
  IntegralData,
  PlotFn,
  RiemannDatum,
} from "../Plot2d/plot2d.chip";

type CellType = "td" | "th";
type CellMap = Map<string, [number, number]>;
type Cell = {
  type: CellType;
  value: string;
  id: string;
  column: string;
  row: number;
};
type Cells = Cell[];

const newCell = (
  type: CellType = "td",
  value: string = "",
  column: string = "",
  row: number = 0,
): Cell => ({ value, type, id: uid(), column, row });

type Row = {
  cells: Cell[];
  id: string;
};

const newRow = (cells: Cell[]): Row => ({ cells, id: uid() });

type Rows = Row[];

const makeRows = (rowCount: number, colCount: number) => {
  const out: Rows = [];
  for (let r = 0; r < rowCount; r++) {
    const cells: Cell[] = [];
    for (let c = 0; c < colCount; c++) {
      const cell = newCell();
      cell.row = r;
      cell.column = latinize(c);
      cells.push(cell);
    }
    out.push(newRow(cells));
  }
  return out;
};

function graphNodesFromCells(cells: Cell[]) {
  const C = cells.length;
  const uids = new Set<string>();
  const nodes: GraphNode[] = [];
  for (let i = 0; i < C; i++) {
    const cell = cells[i];
    if (!cell.value) continue;
    if (!uids.has(cell.id)) {
      nodes.push({ id: cell.id, value: cell.value });
    }
    uids.add(cell.id);
  }
  return nodes;
}

class Spreadsheet {
  columnCount: number;
  rowCount: number;
  focusedCell: string | null;
  selection: Cell[] = [];
  rows: Rows;
  constructor(rows: Rows) {
    this.rows = rows;
    this.focusedCell = null;
    this.rowCount = rows.length;
    this.columnCount = rows[0].cells.length;
  }

  getWritable() {
    return this;
  }
  updateSelection(cells: Cell[]) {
    const self = this.getWritable();
    self.selection = [...cells];
  }

  cellGraph() {
    const self = this.getWritable();
    const cells = self.selection;
    const output: GraphPayload = { nodes: [], links: [] };
    if (cells.length === 0) output;
    const C = cells.length;
    const map: Cell[][] = [];
    const ucells: Cell[] = [];
    const nodes = graphNodesFromCells(cells);
    for (let i = 0; i < C; i++) {
      let cell = cells[i];
      if (!cell.value) continue;
      if (map[cell.row] !== undefined) {
        let neighbor = cell;

        map[cell.row].push(neighbor);
      } else {
        ucells.push(cell);
        map[cell.row] = [];
      }
    }
    const toDelete = new Set<string>();
    for (let i = 0; i < ucells.length; i++) {
      const ucell = ucells[i];
      const source = { id: ucell.id, value: ucell.value };
      for (let j = 0; j < map.length; j++) {
        const neighbors = map[j];
        if (neighbors[0].row !== ucell.row) continue;
        for (let k = 0; k < neighbors.length; k++) {
          let neighbor = neighbors[k];
          if (neighbor.value.startsWith("$")) {
            const value = neighbor.value.slice(1);
            console.log(value);
            const { rowIndex, columnIndex } = getRowCol(value);
            const other = self.getCellAt(rowIndex, columnIndex);
            if (other) {
              toDelete.add(neighbor.id);
              neighbor = other;
            }
          }
          const target = { id: neighbor.id, value: neighbor.value };
          output.links.push({ source: source.id, target: target.id });
        }
      }
    }
    output.nodes = nodes.filter((n) => !toDelete.has(n.id));
    return output;
  }

  static preload(rows: Rows) {
    return new Spreadsheet(rows);
  }

  toggleCellType(rowIndex: number, columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const row = rows[rowIndex];
    const cells = row.cells;
    const cell = cells[columnIndex];
    const type: CellType = cell.type === "td" ? "th" : "td";
    const clonedCells = Array.from(cells);
    const cellClone = { ...cell, type };
    const rowClone = { ...row, ...{ cells: clonedCells } };
    clonedCells[columnIndex] = cellClone;
    rows[rowIndex] = rowClone;
  }

  pushColumns(count: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const C = self.columnCount;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = row.cells;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, ...{ cells: cellsClone } };
      const type = cells[cells.length - 1].type;
      const r = cells[cells.length - 1].row;
      for (let x = 0; x < count; x++) {
        const cell = newCell(type);
        cell.row = r;
        cell.column = latinize(C);
        cellsClone.push(cell);
      }
      rows[y] = rowClone;
    }
    self.columnCount++;
    return this;
  }

  insertColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = row.cells;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, ...{ cells: cellsClone } };
      const type = (cells[columnIndex] || cells[columnIndex - 1]).type;
      cellsClone.splice(columnIndex, 0, newCell(type));
      rows[y] = rowClone;
    }
    self.columnCount++;
    if (this.mustAdjustColumnIds(columnIndex)) {
      this.updateAllColumnIDs();
    }
    return this;
  }

  deleteColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const cells = row.cells;
      const clonedCells = Array.from(cells);
      const rowClone = { ...row, ...{ cells: clonedCells } };
      clonedCells.splice(columnIndex, 1);
      rows[r] = rowClone;
    }
    self.columnCount--;
    if (this.mustAdjustColumnIds(columnIndex)) {
      this.updateAllColumnIDs();
    }
    return this;
  }

  pushRows(count: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const previousRow = rows[rows.length - 1];
    const cellCount = self.columnCount;
    for (let y = 0; y < count; y++) {
      const cells: Cells = [];
      for (let x = 0; x < cellCount; x++) {
        const type = previousRow.cells[x].type;
        const column = previousRow.cells[x].column;
        const cell = newCell(type);
        cell.column = column;
        cell.row = self.rowCount;
        cells.push(cell);
      }
      rows.push(newRow(cells));
    }
    self.rowCount += count;
    return this;
  }

  mustAdjustColumnIds(insertedColumnIndex: number) {
    const self = this.getWritable();
    return (insertedColumnIndex) < self.columnCount;
  }

  mustAdjustRowIDs(insertedRowIndex: number) {
    const self = this.getWritable();
    return (insertedRowIndex) < self.rowCount;
  }

  insertRowAt(rowIndex: number) {
    const self = this.getWritable();
    const mustAdjustRowIDs = self.mustAdjustRowIDs(rowIndex);
    const rows = self.rows;
    const prevRow = rows[rowIndex] || rows[rowIndex - 1];
    const cellCount = prevRow.cells.length;
    const row = newRow([]);
    for (let c = 0; c < cellCount; c++) {
      const type = prevRow.cells[c].type;
      const col = prevRow.cells[c].column;
      const cell = newCell(type);
      cell.column = col;
      row.cells.push(cell);
    }
    rows.splice(rowIndex, 0, row);
    self.rowCount += 1;
    if (mustAdjustRowIDs) {
      this.updateAllRowIDs();
    }
    return this;
  }

  updateAllColumnIDs() {
    const self = this.getWritable();
    const R = self.rowCount;
    const C = self.columnCount;
    for (let r = 0; r < R; r++) {
      const row = self.rows[r];
      const cells = row.cells;
      for (let c = 0; c < C; c++) {
        const cell = cells[c];
        cell.column = latinize(c);
      }
    }
  }

  updateAllRowIDs() {
    const self = this.getWritable();
    const rowCount = self.rowCount;
    const colCount = self.columnCount;
    for (let r = 0; r < rowCount; r++) {
      const row = self.rows[r];
      const cells = row.cells;
      for (let c = 0; c < colCount; c++) {
        const cell = cells[c];
        const clonedCell = { ...cell, row: r };
        cells[c] = clonedCell;
      }
    }
  }

  getCellAt(rowIndex: number, columnIndex: number) {
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return null;
    const cell = row.cells[columnIndex];
    if (cell === undefined) return null;
    return cell;
  }

  deleteRowAt(rowIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    rows.splice(rowIndex, 1);
    self.rowCount--;
    if (this.mustAdjustRowIDs(rowIndex)) {
      this.updateAllRowIDs();
    }
    return this;
  }

  updateCellValue(rowIndex: number, columnIndex: number, value: string) {
    value = value.trimEnd().trimStart();
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return value;
    const cell = row.cells[columnIndex];
    if (cell === undefined) return value;
    if (value.startsWith("=")) {
      value = evaluate(value.slice(1));
    }
    cell.value = value;
    return value;
  }
}

type pSheetContext = {
  children: ReactNode;
  minRowCount: number;
  minColCount: number;
  sheet: React.MutableRefObject<Spreadsheet>;
};
const TableContext = createContext<SheetState>({} as SheetState);
type SheetState = {
  rows: Rows;
  rowCount: number;
  colCount: number;
  pushRow: () => void;
  pushColumn: () => void;
  updateValue: (rowIndex: number, columnIndex: number, value: string) => void;
  focusedCell: string;
  updateFocusedCell: (id: string | null) => void;
  toggleType: (rowIndex: number, columnIndex: number) => void;
  push: (kind: "col" | "row", index: number) => void;
  pop: (kind: "col" | "row", index: number) => void;
  cellmap: CellMap;
  getSelectedCellIDs: (startID: string, endID: string) => Cell[];
  selection: string[];
  updateSelection: React.Dispatch<React.SetStateAction<string[]>>;
  sheet: Spreadsheet;
  primarySelectedID: string;
  setPrimarySelectedID: (x: string | null) => void;
  selectedCellIDs: Cell[];
  setSelectedCellIDs: React.Dispatch<React.SetStateAction<Cell[]>>;
  selectedCellSet: Set<string>;
};
type CellFn = (rowIndex: number, colIndex: number, value: string) => void;
const TableContextProvider = ({
  children,
  minRowCount,
  minColCount,
  sheet,
}: pSheetContext) => {
  const [rowCount, setRowCount] = useState(minRowCount);
  const [colCount, setColCount] = useState(minColCount);

  const cellmap = useMemo(() => {
    const map: CellMap = new Map();
    const rows = sheet.current.rows;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const cells = row.cells;
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        map.set(cell.id, [r, c]);
      }
    }
    return map;
  }, [sheet.current.rows, rowCount, colCount]);

  const [
    currentFocusedCell,
    setCurrentFocusedCell,
  ] = useState<string | null>(null);

  const primarySelectedID = useRef<string>("");
  const focusedCell = useRef<string>("");

  const setPrimarySelectedID = (x: string | null) => {
    primarySelectedID.current = x === null ? "" : x;
  };

  const [
    selection,
    updateSelection,
  ] = useState<string[]>([]);

  const updateValue: CellFn = (rowIndex, colIndex, value) =>
    sheet.current.updateCellValue(rowIndex, colIndex, value);

  const updateFocusedCell = (id: string | null) => {
    focusedCell.current = id === null ? "" : id;
    sheet.current.focusedCell = id;
    setCurrentFocusedCell(id);
  };

  const push = (kind: "col" | "row", index: number) => {
    switch (kind) {
      case "col":
        sheet.current.insertColumnAt(index);
        setColCount((prev) => prev + 1);
        return;
      case "row":
        sheet.current.insertRowAt(index);
        setRowCount((prev) => prev + 1);
        return;
    }
  };

  const pop = (kind: "col" | "row", index: number) => {
    switch (kind) {
      case "col":
        sheet.current.deleteColumnAt(index);
        setColCount((prev) => prev - 1);
        return;
      case "row":
        sheet.current.deleteRowAt(index);
        setRowCount((prev) => prev - 1);
        return;
    }
  };

  const toggleType = (rowIndex: number, columnIndex: number) => {
    sheet.current.toggleCellType(rowIndex, columnIndex);
  };

  const pushRow = () => {
    sheet.current.pushRows(1);
    setRowCount((prev) => prev + 1);
  };

  const pushColumn = () => {
    sheet.current.pushColumns(1);
    setColCount((prev) => prev + 1);
  };

  const getSelectedRect = (startID: string, endID: string) => {
    const startPos = cellmap.get(startID);
    if (startPos === undefined) return null;
    const endPos = cellmap.get(endID);
    if (endPos === undefined) return null;
    const startX = Math.min(startPos[0], endPos[0]);
    const endX = Math.max(startPos[0], endPos[0]);
    const startY = Math.min(startPos[1], endPos[1]);
    const endY = Math.max(startPos[1], endPos[1]);
    return { startX, startY, endX, endY };
  };

  const getSelectedCellIDs = (startID: string, endID: string) => {
    const rect = getSelectedRect(startID, endID);
    if (rect === null) return [];
    const { startX, startY, endX, endY } = rect;
    const ids: Cell[] = [];
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const cell = sheet.current.getCellAt(x, y);
        if (cell === null) continue;
        ids.push(cell);
      }
    }
    return ids;
  };

  const [
    selectedCellIDs,
    setSelectedCellIDs,
  ] = useState<Cell[]>([]);

  const selectedCellSet = useMemo(() => {
    return new Set(selectedCellIDs.map((v) => v.id));
  }, [selectedCellIDs]);

  return (
    <TableContext.Provider
      value={{
        updateValue,
        rows: sheet.current.rows,
        rowCount,
        colCount,
        pushRow,
        pushColumn,
        focusedCell: focusedCell.current,
        updateFocusedCell,
        toggleType,
        push,
        pop,
        cellmap,
        getSelectedCellIDs,
        sheet: sheet.current,
        selection,
        updateSelection,
        primarySelectedID: primarySelectedID.current,
        setPrimarySelectedID,
        selectedCellIDs,
        setSelectedCellIDs,
        selectedCellSet,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

const useTable = () => useContext(TableContext);

type pSheet = {
  minRowCount?: number;
  minColCount?: number;
  initialRows?: Rows;
  initialDisplayState?: DisplayState;
};

export default function Sheet({
  minRowCount = 5,
  minColCount = 5,
  initialRows = makeRows(minRowCount, minColCount),
  initialDisplayState = defaultDisplayState(),
}: pSheet) {
  const sheet = useRef(Spreadsheet.preload(initialRows));

  return (
    <div className={css.sheet_shell}>
      <TOOLBAR sheet={sheet.current} init={initialDisplayState}>
        <TableContextProvider
          minRowCount={minRowCount}
          minColCount={minColCount}
          sheet={sheet}
        >
          <div className={css.vstack}>
            <div className={css.sheet_main}>
              <TABLE />
              <NewColumnButton />
            </div>
            <NewRowButton />
          </div>
        </TableContextProvider>
      </TOOLBAR>
    </div>
  );
}

const getCellID = (domElement: Html) => {
  let node: null | HTMLElement = domElement;
  while (node !== null) {
    const pid = node.getAttribute("data-id");
    if (pid !== null) return pid;
    node = node.parentElement;
  }
  return null;
};

const targetOnControl = (target: Html) => {
  let node: null | Html = target;
  while (node !== null) {
    switch (node.nodeName) {
      case "BUTTON":
      case "INPUT":
      case "TEXTAREA":
        return true;
    }
    node = node.parentElement;
  }
  return false;
};

function TABLE() {
  const {
    rows,
    updateFocusedCell,
    focusedCell,
    rowCount,
    colCount,
    cellmap,
    getSelectedCellIDs,
    sheet,
    primarySelectedID,
    setPrimarySelectedID,
    selectedCellIDs,
    setSelectedCellIDs,
  } = useTable();

  const tableRef = useRef<null | HTMLTableElement>(null);

  const mouseDown = useRef(false);

  const [isSelected, setSelected] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const selectTable = useCallback(() => {
    setTimeout(() => {
      const tableElement = tableRef.current;
      if (tableElement) {
        tableElement.focus({ preventScroll: true });
        window.getSelection()?.removeAllRanges();
      }
    }, 20);
  }, [mouseDown.current]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement === null) {
      return;
    }
    if (document.activeElement === document.body && isSelected) {
      tableElement.focus();
    }
  }, [isSelected]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement === null) {
      return;
    }
    const tableRect = tableElement.getBoundingClientRect();
    const atTableEdge = (clientX: number, clientY: number) => (
      clientX - tableRect.x < 5 || clientY - tableRect.y < 5
    );
    const handlePointerDown = (e: PointerEvent) => {
      const pid = getCellID(e.target as Html);
      if (pid !== null && tableElement.contains(e.target as Html)) {
        if (atTableEdge(e.clientX, e.clientY)) {
          setSelected(true);
          setPrimarySelectedID(null);
          selectTable();
          return;
        }
        setSelected(false);
        mouseDown.current = true;
        let lastID: string | null = null;
        if (primarySelectedID !== pid) {
          setPrimarySelectedID(pid);
          setIsEditing(false);
          lastID = pid;
        }
        updateFocusedCell(lastID);
        setSelectedCellIDs([]);
        sheet.updateSelection([]);
        return;
      }
      if (primarySelectedID !== null && !targetOnControl(e.target as Html)) {
        setSelected(false);
        mouseDown.current = false;
        setPrimarySelectedID(null);
        setSelectedCellIDs([]);
        sheet.updateSelection([]);
        setIsEditing(false);
        updateFocusedCell(null);
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (isEditing || !mouseDown.current || primarySelectedID === null) {
        return;
      }
      const pid = getCellID(e.target as Html);
      if (pid === null || pid === focusedCell) {
        return;
      }
      if (selectedCellIDs.length === 0) {
        tableElement.style.userSelect = "none";
      }
      const ids = getSelectedCellIDs(primarySelectedID, pid);
      setSelectedCellIDs(ids.length === 1 ? [] : ids);
      sheet.updateSelection(ids.length === 1 ? [] : ids);
      updateFocusedCell(pid);
    };
    const handlePointerUp = () => {
      if (tableElement && mouseDown.current && selectedCellIDs.length > 1) {
        tableElement.style.userSelect = "text";
        window.getSelection()?.removeAllRanges();
      }
      mouseDown.current = false;
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    rows,
    primarySelectedID,
    cellmap,
  ]);
  useEffect(() => {
    const handleDblClick = (event: MouseEvent) => {
      const pid = getCellID(event.target as Html);
      if (pid === primarySelectedID) {
        setIsEditing(true);
        setSelectedCellIDs([]);
      }
    };
    document.addEventListener("dblclick", handleDblClick);
    return () => {
      document.removeEventListener("dblclick", handleDblClick);
    };
  }, [
    rowCount,
    colCount,
    isEditing,
    rows,
    primarySelectedID,
    cellmap,
  ]);
  return (
    <div className={css.sheet_table_wrapper}>
      <table className={css.sheet_table} ref={tableRef} tabIndex={-1}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <RowIndex key={row.id} rowIndex={rowIndex} colCount={colCount}>
              <tr>
                {row.cells.map((cell, columnIndex) => (
                  <Column key={cell.id} col={columnIndex} row={rowIndex}>
                    <CellProvider cell={cell} isEditing={isEditing}>
                      <CELL>
                        <INPUT />
                        <TEXT />
                        <MENU />
                      </CELL>
                    </CellProvider>
                  </Column>
                ))}
              </tr>
            </RowIndex>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Column({ col, row, children }:
  & { col: number; row: number }
  & Children) {
  return (
    <Fragment>
      {col === 0 && <td className={css.sheet_axis_cell}>{row}</td>}
      {children}
    </Fragment>
  );
}

function RowIndex({ rowIndex, children, colCount }:
  & { rowIndex: number; colCount: number }
  & Children) {
  const asciiRows = useMemo(() => {
    return range(0, colCount + 1).map((n) => latinize(n - 1));
  }, [colCount]);
  return (
    <Fragment>
      {rowIndex === 0 && (
        <tr>
          {asciiRows.map((letter, i) => (
            <Fragment key={i + "col" + letter}>
              {i === 0 ? <HEADER of={""} /> : <HEADER of={letter} />}
            </Fragment>
          ))}
        </tr>
      )}
      {children}
    </Fragment>
  );
}

function HEADER({ of }: { of: string }) {
  return <th className={css.sheet_axis_cell}>{of}</th>;
}

interface CellCtx {
  type: CellType;
  value: string;
  rowIndex: number;
  columnIndex: number;
  colChar: string;
  isSelected: boolean;
  isPrimarySelected: boolean;
  isEditing: boolean;
  id: string;
  setCurrentType: React.Dispatch<React.SetStateAction<"td" | "th">>;
  updateCellValue: InputFn;
}

const CellContext = createContext<CellCtx>({} as CellCtx);

type pCELL = {
  children: ReactNode;
  isEditing: boolean;
  cell: Cell;
};

function CellProvider({
  children,
  cell,
  isEditing,
}: pCELL) {
  const { sheet, cellmap, primarySelectedID, selectedCellSet } = useTable();
  const rowcol = cellmap.get(cell.id);
  if (rowcol === undefined) {
    return null;
  }
  const [rowIndex, columnIndex] = rowcol;
  const [val, setVal] = useState(cell.value);
  const [currentType, setCurrentType] = useState(cell.type);
  const id = cell.id;

  useEffect(() => {
    if (isEditing === false) {
      sheet.updateCellValue(cell.row, columnIndex, val);
      setVal(cell.value);
    }
  }, [isEditing]);

  const updateCellValue: InputFn = (event) => {
    event.stopPropagation();
    setVal(event.target.value);
  };

  return (
    <CellContext.Provider
      value={{
        type: currentType,
        value: val,
        rowIndex,
        columnIndex,
        isSelected: selectedCellSet.has(id),
        isPrimarySelected: primarySelectedID === id,
        isEditing,
        id,
        setCurrentType,
        updateCellValue,
        colChar: cell.column,
      }}
    >
      {children}
    </CellContext.Provider>
  );
}

const useCell = () => useContext(CellContext);

type CellAPI = {
  children: ReactNode;
};

function CELL({
  children,
}: CellAPI) {
  const {
    id,
    type,
    isSelected,
    isPrimarySelected,
  } = useCell();
  const Box = type;
  return (
    <Box
      data-id={id}
      tabIndex={-1}
      className={(type === "td" ? css.sheet_cell : css.sheet_header) +
        (isSelected ? " " + css.sheet_selected : "") +
        (isPrimarySelected ? " " + css.sheet_focus : "")}
    >
      <div className={css.sheet_cell_content}>
        {children}
      </div>
    </Box>
  );
}

function TEXT() {
  const {
    value,
    isPrimarySelected,
    isEditing,
  } = useCell();
  return (!(isPrimarySelected && isEditing))
    ? (
      <div className={css.sheet_text + " " + css.sheet_readonly}>
        {value}
      </div>
    )
    : (null);
}

const INPUT = () => {
  const { value, updateCellValue, isPrimarySelected, isEditing } = useCell();
  return isPrimarySelected && isEditing
    ? (
      <input
        value={value}
        onChange={updateCellValue}
        autoFocus
        className={css.sheet_writable}
      />
    )
    : (null);
};

const MENU = () => {
  const { toggleType, push, pop, rowCount, colCount } = useTable();
  const { rowIndex, columnIndex, type, setCurrentType } = useCell();
  return (
    <Dropdown
      title={<Chevron />}
      topOffset={5}
      leftOffset={25}
      containerClass={css.sheet_menu}
    >
      <Option
        label={type === "td" ? "Set header" : "Unset header"}
        click={() => {
          toggleType(rowIndex, columnIndex);
          setCurrentType(type === "td" ? "th" : "td");
        }}
      />
      <Option
        label={"Add left column"}
        click={() => push("col", columnIndex)}
      />
      {columnIndex !== 0 && (
        <Option
          label={"Delete left column"}
          click={() => pop("col", columnIndex - 1)}
        />
      )}
      <Option
        label={"Add right column"}
        click={() => push("col", columnIndex + 1)}
      />
      {columnIndex !== colCount - 1 && (
        <Option
          label={"Delete right column"}
          click={() => pop("col", columnIndex + 1)}
        />
      )}
      <Option
        label={"Add row above"}
        click={() => push("row", rowIndex)}
      />
      {rowIndex !== 0 && (
        <Option
          label={"Delete row above"}
          click={() => pop("row", rowIndex - 1)}
        />
      )}
      <Option
        label={"Add row below"}
        click={() => push("row", rowIndex + 1)}
      />
      {rowIndex !== rowCount - 1 && (
        <Option
          label={"Delete row below"}
          click={() => pop("row", rowIndex + 1)}
        />
      )}
    </Dropdown>
  );
};

const NewColumnButton = () => {
  const { pushColumn, setSelectedCellIDs, sheet } = useTable();
  return (
    <div className={css.sidecontrol}>
      <button
        className={css.new_col_button}
        onClick={() => {
          setSelectedCellIDs([]);
          sheet.updateSelection([]);
          pushColumn();
        }}
      >
        <div className={css.plus_button} />
      </button>
    </div>
  );
};

const NewRowButton = () => {
  const { pushRow, setSelectedCellIDs, sheet } = useTable();
  return (
    <div className={css.sidecontrol}>
      <button
        className={css.new_row_button}
        onClick={() => {
          setSelectedCellIDs([]);
          sheet.updateSelection([]);
          pushRow();
        }}
      >
        <div className={css.plus_button} />
      </button>
    </div>
  );
};

function defaultDisplayState(): DisplayState {
  return ({
    graph: {
      render: false,
      data: { nodes: [], links: [] },
    },
  });
}

type GraphPayload = {
  nodes: GraphNode[];
  links: Link[];
};

type DisplayState = {
  graph: {
    render: boolean;
    data: GraphPayload;
  };
};

type pTOOLBAR = {
  init: DisplayState;
  sheet: Spreadsheet;
} & Children;

function TOOLBAR({ children, sheet, init }: pTOOLBAR) {
  const [plot2dData, setPlot2dData] = useState<PlotRender | null>(null);
  const [plot2d, openPlot2d] = useState(false);
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  return (
    <Fragment>
      <aside>
        <Button
          label={"Graph Selection"}
          click={() =>
            setGraph(
              sheet.selection.length > 0 ? sheet.cellGraph() : null,
            )}
        />
        <Button label={"Plot2D"} click={() => openPlot2d(!plot2d)} />
      </aside>
      {graph && <GRAPH nodes={graph.nodes} links={graph.links} />}
      {plot2d && (
        <article className={app.modal}>
          <Button
            className={app.close}
            label={"\u00d7"}
            click={() => openPlot2d(!plot2d)}
          />
          <Plot2DForm onSave={setPlot2dData}>
            {plot2dData && (
              <Plot2D
                functions={plot2dData.functions}
                domain={plot2dData.domain}
                range={plot2dData.range}
                ticks={plot2dData.ticks}
              />
            )}
          </Plot2DForm>
        </article>
      )}
      {children}
    </Fragment>
  );
}






const defaultPayload: PlotFn = {
  fn: "",
  id: "demo",
  domain: [-10, 10],
  range: [-10, 10],
  samples: 170,
  color: "#ff0000",
  riemann: {
    domain: [NaN, NaN],
    dx: 0.5,
    method: "left",
    color: "#ff0000",
  },
  integrate: {
    bounds: [NaN, NaN],
    color: "#ff0000",
  },
};

type BasePlotUpdate = (d: Partial<BasePlotFn>) => void;

type RiemannUpdate = (d: Partial<RiemannDatum>) => void;

type IntegralUpdate = (d: Partial<IntegralData>) => void;

type PlotRender = {
  functions: PlotFn[];
  domain: [number, number];
  range: [number, number];
  ticks: number;
};

type pPlotFns = {
  onSave: (payload: PlotRender) => void;
};
function Plot2DForm({ children, onSave }: pPlotFns & Children) {
  const [
    plot2dEntries,
    setPlot2dEntries,
  ] = useState<PlotFn[]>([defaultPayload]);

  const [axesDomain, setAxesDomain] = useState<[number, number]>([-10, 10]);
  const [axesRange, setAxesRange] = useState<[number, number]>([-10, 10]);
  const [ticks, setTicks] = useState<number>(10);

  const save = () => {
    const L = plot2dEntries.length;
    const functions: PlotFn[] = [];
    for (let i = 0; i < L; i++) {
      const fn = plot2dEntries[i];
      if (fn.fn === "") continue;
      if (fn.domain[0] >= fn.domain[1]) continue;
      if (fn.range[0] >= fn.domain[1]) continue;
      if (fn.samples <= 0 || 600 <= fn.samples) continue;
      functions.push(fn);
    }
    functions.length > 0 && onSave({
      functions,
      domain: axesDomain,
      range: axesRange,
      ticks: ticks,
    });
  };

  const updateBasePlot = (index: number) => {
    return (payload: Partial<BasePlotFn>) => {
      const entry = plot2dEntries[index];
      if (entry === undefined) return;
      const clone = { ...entry };
      const update = { ...clone, ...payload };
      setPlot2dEntries(plot2dEntries.map((E, i) => (i === index ? update : E)));
    };
  };

  const updateRiemann = (index: number) => {
    return (d: Partial<RiemannDatum>) => {
      const entry = plot2dEntries[index];
      if (entry === undefined) return;
      const clone: PlotFn = { ...entry };
      const prevRiemann = entry.riemann;
      if (prevRiemann === undefined) return;
      const update = { ...prevRiemann, ...d };
      clone.riemann = update;
      setPlot2dEntries(plot2dEntries.map((E, i) => (i === index ? clone : E)));
    };
  };

  const updateIntegral = (index: number) => {
    return (d: Partial<IntegralData>) => {
      const entry = plot2dEntries[index];
      const clone: PlotFn = { ...entry };
      const prevIntegral = entry.integrate;
      if (prevIntegral === undefined) return;
      const update = { ...prevIntegral, ...d };
      clone.integrate = update;
      setPlot2dEntries(plot2dEntries.map((E, i) => (i === index ? clone : E)));
    };
  };

  const onDelete = (index: number) => {
    setPlot2dEntries(plot2dEntries.filter((E, i) => i !== index));
  };

  const addFunction = () => {
    setPlot2dEntries((prev) => [...prev, defaultPayload]);
  };

  return (
    <Fragment>
      <Form
        onSave={save}
        afix={[{ label: "Add function", act: addFunction }]}
        atop={[
          { label: "Axes Domain", interval: axesDomain, act: setAxesDomain },
          { label: "Axes Range", interval: axesRange, act: setAxesRange },
          { label: "Axes Ticks", num: ticks, act: setTicks },
        ]}
      >
        {plot2dEntries.map((d, i) => (
          <div key={d.fn + i} className={app.card}>
            <Button
              className={app.delete}
              label={"\u00d7"}
              click={() => onDelete(i)}
            />
            <FunctionForm
              fn={d.fn}
              domain={d.domain}
              range={d.range}
              samples={d.samples}
              curveColor={d.color}
              update={updateBasePlot(i)}
            >
              {d.integrate && (
                <IntegralForm
                  integral={d.integrate.bounds}
                  integralColor={d.integrate.color}
                  update={updateIntegral(i)}
                />
              )}

              {d.riemann && (
                <RiemannForm
                  rDomain={d.riemann.domain}
                  dx={d.riemann.dx}
                  method={d.riemann!.method}
                  rectColor={d.riemann!.color}
                  update={updateRiemann(i)}
                  render={true}
                />
              )}
            </FunctionForm>
          </div>
        ))}
      </Form>
      {children}
    </Fragment>
  );
}

type RiemannMethod = "left" | "midpoint" | "right";
const methods: RiemannMethod[] = ["left", "midpoint", "right"];

type pPlot2DForm = {
  fn: string;
  domain: [number, number];
  range: [number, number];
  samples: number;
  curveColor: string;
  update: BasePlotUpdate;
};

type pRiemannForm = {
  rectColor: string;
  rDomain: [number, number];
  dx: number;
  method: RiemannMethod;
  update: RiemannUpdate;
  render: boolean;
};

function RiemannForm(props: pRiemannForm) {
  const setColor = (color: string) => props.update({ color });
  const setDx = (dx: number) => props.update({ dx });
  const setDomain = (domain: [number, number]) => props.update({ domain });
  const setMethod = (method: RiemannMethod) => props.update({ method });
  const update = (x: boolean) => {
    if (x) {
      props.update({ domain: [-3, 3] });
    } else {
      props.update({ domain: [NaN, NaN] });
    }
  };
  return (
    <Optional
      val={!(isNaN(props.rDomain[0]) && isNaN(props.rDomain[0]))}
      act={update}
      label={"Riemann Sums"}
    >
      <Form
        isolated
        fields={[
          {
            label: "Interval",
            interval: props.rDomain,
            act: setDomain,
            allowFloats: [true, true],
          },
          { label: "dx", range: props.dx, max: 5, min: 0, act: setDx },
          {
            label: "Method",
            options: methods,
            act: setMethod,
            val: props.method,
          },
        ]}
      >
        <Palette
          label={"Rectangle Color"}
          act={setColor}
          init={props.rectColor}
        />
      </Form>
    </Optional>
  );
}

type pIntegralForm = {
  integral: [number, number];
  integralColor: string;
  update: IntegralUpdate;
};

function IntegralForm(props: pIntegralForm) {
  const setIntegral = (bounds: [number, number]) => props.update({ bounds });
  const setColor = (color: string) => props.update({ color });

  const update = (x: boolean) => {
    if (x) {
      props.update({ bounds: [-3, 3] });
    } else {
      props.update({ bounds: [NaN, NaN] });
    }
  };

  return (
    <Optional
      val={!(isNaN(props.integral[0]) && isNaN(props.integral[1]))}
      act={update}
      label={"Integrate"}
    >
      <Form
        isolated
        fields={[
          {
            label: "Interval",
            interval: props.integral,
            act: setIntegral,
            allowFloats: [true, true],
          },
        ]}
      >
        <Palette
          label={"Area Color"}
          act={setColor}
          init={props.integralColor}
        />
      </Form>
    </Optional>
  );
}

function FunctionForm(props: pPlot2DForm & Children) {
  const setFn = (fn: string) => props.update({ fn });
  const setRange = (range: [number, number]) => props.update({ range });
  const setDomain = (domain: [number, number]) => props.update({ domain });
  const setSamples = (samples: number) => props.update({ samples });
  const setColor = (color: string) => props.update({ color });
  return (
    <Form
      isolated
      fields={[
        { label: "Function", text: props.fn, act: setFn, temp: "" },
        {
          label: "Domain",
          interval: props.domain,
          act: setDomain,
          allowFloats: [true, true],
        },
        {
          label: "Range",
          interval: props.range,
          act: setRange,
          allowFloats: [true, true],
        },
        { label: "Samples", num: props.samples, act: setSamples },
      ]}
    >
      <Palette
        label={"Curve color"}
        act={setColor}
        init={props.curveColor}
      />
      {props.children}
    </Form>
  );
}

type TextField = {
  text: string;
  label: string;
  temp: string;
  act: (val: string) => void;
};
const isText = (x: any): x is TextField => x["text"] !== undefined;

type OptionList<t extends string> = {
  label: string;
  options: t[];
  val: t;
  act: (x: t) => void;
};

const isOptionList = <t extends string>(x: any): x is OptionList<t> =>
  x["options"] !== undefined;

type NumberField = {
  num: number;
  label: string;
  act: (val: number) => void;
  min?: number;
  max?: number;
  nonnegative?: boolean;
  allowFloat?: boolean;
};
const isNum = (x: any): x is NumberField => x["num"] !== undefined;
type SwitchField = {
  bool: boolean;
  label: string;
  act: () => void;
};
const isSwitch = (x: any): x is SwitchField => x["bool"] !== undefined;
type RangeField = {
  range: number;
  label: string;
  max: number;
  min: number;
  act: (x: number) => void;
};
const isRange = (x: any): x is RangeField => x["range"] !== undefined;
type IntervalField = {
  label: string;
  interval: [number, number];
  allowFloats?: [boolean, boolean];
  act: (x: [number, number]) => void;
};
const isInterval = (x: any): x is IntervalField => x["interval"] !== undefined;

type FormField<t extends string> =
  | TextField
  | NumberField
  | SwitchField
  | RangeField
  | OptionList<t>
  | IntervalField;

interface FormAPI<t extends string> {
  fields?: FormField<t>[];
  atop?: FormField<t>[];
  isolated?: boolean;
  afix?: { act: () => void; label: string; css?: string }[];
  onSave?: () => void;
}

const Entry = <t extends string>({ x }: { x: FormField<t> }) => {
  if (isText(x)) {
    return <TextInput temp={x.temp} val={x.text} act={x.act} />;
  }
  if (isNum(x)) {
    return (
      <NumberInput
        allowFloat={x.allowFloat}
        val={x.num}
        nonnegative={x.nonnegative}
        act={x.act}
        min={x.min}
        max={x.max}
      />
    );
  }
  if (isSwitch(x)) {
    return <Switch act={x.act} val={x.bool} />;
  }
  if (isRange(x)) {
    return <Range act={x.act} val={x.range} min={x.min} max={x.max} />;
  }
  if (isInterval(x)) {
    return (
      <Interval allowFloats={x.allowFloats} val={x.interval} act={x.act} />
    );
  }
  if (isOptionList(x)) {
    return <OptionsList val={x.val} options={x.options} act={x.act} />;
  }
  return <></>;
};

function Form<t extends string>({
  fields = [],
  children,
  isolated = false,
  onSave,
  atop,
  afix,
}: FormAPI<t> & Children) {
  return (
    <Shell
      condition={!isolated}
      wrapper={(children) => <menu>{children}</menu>}
    >
      {atop && (
        <header>
          {atop.map((field, i) => (
            <Field key={field.label + i} label={field.label}>
              <Entry x={field} />
            </Field>
          ))}
        </header>
      )}
      <article>
        {fields.map((field, i) => (
          <Field key={field.label + i} label={field.label}>
            <Entry x={field} />
          </Field>
        ))}
        {children}
      </article>
      {afix &&
        afix.map((a) => (
          <Button
            label={a.label}
            className={a.css || app.longwhitebutton}
            key={a.label}
            click={a.act}
          />
        ))}
      {!isolated && onSave && (
        <Button
          click={onSave}
          label={"Save"}
          className={css.saveButton}
        />
      )}
    </Shell>
  );
}

type pShell = {
  condition: boolean;
  wrapper: (children: ReactNode) => JSX.Element;
  children: ReactNode;
};

const Shell = ({ condition, wrapper, children }: pShell) => {
  return condition ? wrapper(children) : <>{children}</>;
};

import app from "../../ui/styles/App.module.scss";

function Field({ children, label }: Children & { label: string }) {
  return (
    <section className={app.field}>
      <label>{label}</label>
      {children}
    </section>
  );
}
