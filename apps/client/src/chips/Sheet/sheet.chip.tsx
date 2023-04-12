import {
  createContext,
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  digitize26,
  evaluate,
  getRowCol,
  latinize,
  range,
  uid,
} from "@webtex/algom";
import { Html } from "src/util";
import css from "../../ui/styles/sheet.module.scss";
import app from "../../ui/styles/App.module.scss";
import { Dropdown, Option } from "../Dropdown";
import { Chevron } from "../Icon";
import { InputFn } from "src/App";
import GRAPH, { GraphNode, Link } from "../Graph/graph.chip";
import { UserFunc } from "../Plot2d/plot2d.chip";
import { Button, Range } from "../Inputs";
import { Interval } from "../Interval";

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
    const links: Link[] = [];
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
type IDPayload = {
  id: string;
  rowIndex: number;
  columnIndex: number;
};
type IDPayloadFty = (
  id: string,
  rowIndex: number,
  columnIndex: number,
) => IDPayload;

const newIDPayload: IDPayloadFty = (id, rowIndex, columnIndex) => ({
  id,
  rowIndex,
  columnIndex,
});

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
  asciiRows: string[];
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

  const asciiRows = useMemo(() => {
    return range(0, colCount + 1).map((n) => latinize(n - 1));
  }, [colCount]);

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
        asciiRows,
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

type GraphPayload = {
  nodes: GraphNode[];
  links: Link[];
};
type DisplayState = {
  counter: {
    render: boolean;
    data: number;
  };
  graph: {
    render: boolean;
    data: GraphPayload;
  };
  plot2d: {
    render: boolean;
    data: UserFunc;
  };
};

type DisplayAction =
  | { type: "graph"; payload: GraphPayload }
  | { type: "plot2d"; payload: UserFunc };

function reducer(state: DisplayState, action: DisplayAction): DisplayState {
  const { type, payload } = action;
  switch (type) {
    case "plot2d":
      return {
        ...state,
        plot2d: {
          render: true,
          data: payload,
        },
      };
    case "graph":
      return {
        ...state,
        graph: {
          render: true,
          data: payload,
        },
      };
    default:
      return state;
  }
}

const defaultDisplayState: DisplayState = {
  counter: {
    render: false,
    data: 0,
  },
  graph: {
    render: false,
    data: { nodes: [], links: [] },
  },
  plot2d: {
    render: false,
    data: { f: "" },
  },
};

export default function Sheet({
  minRowCount = 5,
  minColCount = 5,
  initialRows = makeRows(minRowCount, minColCount),
  initialDisplayState = defaultDisplayState,
}: pSheet) {
  const sheet = useRef(Spreadsheet.preload(initialRows));
  const [state, dispatch] = useReducer(reducer, initialDisplayState);

  const handlers = useMemo(() => ({
    Graph: () =>
      dispatch({
        type: "graph",
        payload: sheet.current.cellGraph(),
      }),
  }), []);

  return (
    <div className={css.sheet_shell}>
      <TOOLBAR actions={handlers} />
      <TableContextProvider
        minRowCount={minRowCount}
        minColCount={minColCount}
        sheet={sheet}
      >
        <MAIN />
      </TableContextProvider>
      {state.graph.render && <Network data={state.graph.data} />}
      {state.plot2d.render && <DEBUGGER data={state.plot2d.data} />}
    </div>
  );
}

type Op = { [key: string]: () => void };
interface pTOOLBAR {
  actions: Op;
}

const dPlot2d = (f: string): UserFunc => ({
  f,
  samples: 100,
  domain: [-10, 10],
  range: [-10, 10],
  integrate: [-3, 3],
  riemann: {
    orient: "left",
    precision: 100,
    domain: [-4, 4],
    on: "2x",
  },
});

function TOOLBAR({ actions }: pTOOLBAR) {
  const [showPlot2d, setShowPlot2d] = useState(true);
  const [plot2d, setPlot2D] = useState<UserFunc[]>([
    dPlot2d("f(x) = cos(x)"),
    dPlot2d("f(x) = sin(x)"),
  ]);
  return (
    <div className={css.sheet_toolbar}>
      {Object.entries(actions).map(([label, action], i) => (
        <button key={`sheet-${i}-${label}`} onClick={action}>{label}</button>
      ))}
      <button
        children={"Plot2D"}
        onClick={() => setShowPlot2d(!showPlot2d)}
      />
      <button>{"Plot3D"}</button>
      <button>{"Bar Plot"}</button>
      <button>{"Scatter Plot"}</button>
      <button>{"Eval"}</button>
      {showPlot2d && (
        <Plot2DMenu
          userFunctions={plot2d}
          setShowFuncs={setShowPlot2d}
        />
      )}
    </div>
  );
}

type pMenuPlot2d = {
  setShowFuncs: (b: boolean) => void;
  userFunctions: UserFunc[];
};

type FH = { data: string; onChange: (x: string) => void };
function FunctionHandler({ data, onChange }: FH) {
  const [val, setVal] = useState(data);
  return (
    <section>
      <label>Function</label>
      <input
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onChange(val)}
        value={val}
      />
    </section>
  );
}

type DItvl = {
  data: [number, number];
};

function IntegralHandler({ data }: DItvl) {
  return (
    <section>
      <label>Integrate</label>
      <Interval
        value={data}
        containerClass={css.fint}
        onChange={() => null}
      />
    </section>
  );
}

function RangeHandler({ data }: { data: [number, number] }) {
  return (
    <section>
      <label>Domain</label>
      <Interval
        value={data}
        containerClass={css.fint}
        onChange={() => null}
      />
    </section>
  );
}

function DomainHandler({ data }: { data: [number, number] }) {
  const [interval, setInterval] = useState(data);
  return (
    <section>
      <label>Domain</label>
      <Interval
        value={interval}
        containerClass={css.fint}
        onChange={setInterval}
      />
    </section>
  );
}

function SamplesHandler({ data }: { data: number }) {
  return (
    <section>
      <label>Samples</label>
      <Range
        minValue={10}
        maxValue={1000}
        initialValue={data}
      />
    </section>
  );
}
type PFnItem = {
  fn: UserFunc;
  index: number;
};

function Plot2DMenuItem({ fn, index }: PFnItem) {
  const [f, setF] = useState(fn.f);
  const [domain, setDomain] = useState(fn.domain || [-10, 10]);
  const [range, setRange] = useState(fn.range || [-10, 10]);
  return (
    <div className={css.item}>
      <FunctionHandler data={f} onChange={setF} />
      <DomainHandler data={fn.domain || [-10, 10]} />
      <RangeHandler data={fn.range || [-10, 10]} />
      <IntegralHandler data={fn.domain || [-10, 10]} />
      <SamplesHandler data={fn.samples || 100} />
      <Button label={"Update"} click={() => null} />
    </div>
  );
}

function Plot2DMenu({
  setShowFuncs,
  userFunctions,
}: pMenuPlot2d) {
  return (
    <menu className={css.menu}>
      <Button
        label={"\u00d7"}
        click={() => setShowFuncs(false)}
        className={css.close}
      />
      {userFunctions.map((ufn, i) => (
        <Plot2DMenuItem index={i} key={ufn.f + "func" + i} fn={ufn} />
      ))}
      <button className={css.newfunc}>
        New Function
      </button>
    </menu>
  );
}

function MAIN() {
  return (
    <div className={app.vstack}>
      <div className={css.sheet_main}>
        <TABLE />
        <NewColumnButton />
      </div>
      <NewRowButton />
      {/* <DEBUGGER data={sheet} /> */}
    </div>
  );
}

type pNetwork = {
  data: { nodes: GraphNode[]; links: Link[] };
};

function Network({ data }: pNetwork) {
  return (
    <div>
      <GRAPH nodes={data.nodes} links={data.links} />
    </div>
  );
}

const EXPRINPUT = () => {
  const { focusedCell } = useTable();
  const [formula, setFormula] = useState("");
  return (
    <input
      type={"text"}
      value={formula}
      placeholder={focusedCell}
      onChange={(E) => setFormula(E.target.value)}
    />
  );
};

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
      <table
        className={css.sheet_table}
        ref={tableRef}
        tabIndex={-1}
      >
        <tbody>
          {rows.map((row, rowIndex) => (
            <ROW
              cells={row.cells}
              rowIndex={rowIndex}
              isEditing={isEditing}
              key={row.id + rowIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ROW = (
  { cells, rowIndex, isEditing }: {
    cells: Cell[];
    rowIndex: number;
    isEditing: boolean;
  },
) => {
  return (
    <Fragment>
      {rowIndex === 0 && <RowIndices />}
      <tr>
        {cells.map((cell, columnIndex) => (
          <Fragment key={cell.id + columnIndex}>
            {columnIndex === 0 && (
              <td className={css.sheet_axis_cell}>{rowIndex}</td>
            )}
            <CellProvider cell={cell} isEditing={isEditing}>
              <CELL>
                <INPUT />
                <TEXT />
                <MENU />
              </CELL>
            </CellProvider>
          </Fragment>
        ))}
      </tr>
    </Fragment>
  );
};

function RowIndices() {
  const { asciiRows } = useTable();
  return (
    <tr>
      {asciiRows.map((letter, i) => (
        <Fragment key={i + "col" + letter}>
          {i === 0 ? <HEADER of={""} /> : <HEADER of={letter} />}
        </Fragment>
      ))}
    </tr>
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

const DEBUGGER = ({ data = {} }: { data: Object }) => {
  return (
    <div className={css.debug}>
      <pre>
        {JSON.stringify(data, null, 4)}
      </pre>
    </div>
  );
};
