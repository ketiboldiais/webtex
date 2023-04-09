import {
  createContext,
  Fragment,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { range, uid } from "src/algom";
import { Html } from "src/util";
import css from "../../ui/styles/sheet.module.scss";
import app from "../../ui/styles/App.module.scss";
import { Dropdown, Option } from "../Dropdown";
import { Chevron } from "../Icon";

type CellType = "td" | "th";
type CellMap = Map<string, [number, number]>;
type Cell = {
  type: CellType;
  value: string;
  id: string;
};
type Cells = Cell[];

const newCell = (
  type: CellType = "td",
  value: string = "",
): Cell => ({ value, type, id: uid() });

const makeCells = (count: number) => {
  const out: Cell[] = [];
  for (let i = 0; i < count; i++) {
    out.push(newCell());
  }
  return out;
};

const rebase = (num: number): string => {
  const div = Math.floor(num / 26);
  const rem = Math.floor(num % 26);
  const char = String.fromCharCode(rem + 97).toUpperCase();
  return div - 1 >= 0 ? rebase(div - 1) + char : char;
};

type Row = {
  cells: Cell[];
  id: string;
};

const newRow = (cells: Cell[]): Row => ({ cells, id: uid() });

type Rows = Row[];

const makeRows = (rowCount: number, colCount: number) => {
  const out: Rows = [];
  for (let i = 0; i < rowCount; i++) {
    out.push(newRow(makeCells(colCount)));
  }
  return out;
};

class Spreadsheet {
  rows: Rows;
  lastEditedCell: string | null;
  constructor(rows: Rows) {
    this.rows = rows;
    this.lastEditedCell = null;
  }

  getWritable() {
    return this;
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
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = row.cells;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, ...{ cells: cellsClone } };
      const type = cells[cells.length - 1].type;
      for (let x = 0; x < count; x++) {
        cellsClone.push(newCell(type));
      }
      rows[y] = rowClone;
    }
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
  }

  pushRows(count: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const previousRow = rows[rows.length - 1];
    const cellCount = previousRow.cells.length;
    for (let y = 0; y < count; y++) {
      const cells: Cells = [];
      for (let x = 0; x < cellCount; x++) {
        const type = previousRow.cells[x].type;
        cells.push(newCell(type));
      }
      rows.push(newRow(cells));
    }
    return this;
  }

  insertRowAt(rowIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const prevRow = rows[rowIndex] || rows[rowIndex - 1];
    const cellCount = prevRow.cells.length;
    const row = newRow([]);
    for (let c = 0; c < cellCount; c++) {
      const cell = newCell(prevRow.cells[c].type);
      row.cells.push(cell);
    }
    rows.splice(rowIndex, 0, row);
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
  }

  updateCellValue(rowIndex: number, columnIndex: number, value: string) {
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return this;
    const cell = row.cells[columnIndex];
    if (cell === undefined) return this;
    cell.value = value;
    return this;
  }
}

type pSheetContext = {
  children: ReactNode;
  initialRows: Rows;
  minRowCount: number;
  minColCount: number;
};
const SheetContext = createContext<SheetState>({} as SheetState);
type SheetState = {
  rows: Rows;
  rowCount: number;
  colCount: number;
  pushRow: () => void;
  pushColumn: () => void;
  updateValue: (rowIndex: number, columnIndex: number, value: string) => void;
  lastEditedCell: MutableRefObject<string | null>;
  updateLastEditedCell: (id: string | null) => void;
  toggleType: (rowIndex: number, columnIndex: number) => void;
  push: (kind: "col" | "row", index: number) => void;
  pop: (kind: "col" | "row", index: number) => void;
  cellmap: CellMap;
  getSelectedCellIDs: (startID: string, endID: string) => string[];
  sheet: Spreadsheet;
};

const SheetContextProvider = ({
  children,
  initialRows,
  minRowCount,
  minColCount,
}: pSheetContext) => {
  const sheet = useRef(Spreadsheet.preload(initialRows));
  const [rowCount, setRowCount] = useState(minRowCount);
  const [colCount, setColCount] = useState(minColCount);
  const [lastUpdate, setLastUpdate] = useState("");
  const lastEditedCell = useRef<string | null>(null);

  const updateValue = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    sheet.current.updateCellValue(rowIndex, colIndex, value);
  };

  const updateLastEditedCell = (id: string | null) => {
    lastEditedCell.current = id;
    if (id !== null) {
      sheet.current.lastEditedCell = id;
    }
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
    const ids: string[] = [];
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const cell = sheet.current.getCellAt(x, y);
        cell && ids.push(cell.id);
      }
    }
    return ids;
  };

  return (
    <SheetContext.Provider
      value={{
        updateValue,
        rows: sheet.current.rows,
        rowCount,
        colCount,
        pushRow,
        pushColumn,
        lastEditedCell,
        updateLastEditedCell,
        toggleType,
        push,
        pop,
        cellmap,
        getSelectedCellIDs,
        sheet: sheet.current,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
};

const useSheet = () => useContext(SheetContext);

type pSheetProps = Partial<
  Pick<
    pSheetContext,
    "initialRows" | "minColCount" | "minRowCount"
  >
>;
export default function Sheet({
  minRowCount = 5,
  minColCount = 5,
  initialRows = makeRows(minRowCount, minColCount),
}: pSheetProps) {
  return (
    <SheetContextProvider
      minRowCount={minRowCount}
      minColCount={minColCount}
      initialRows={initialRows}
    >
      <div className={css.sheet_shell}>
        <TOOLBAR />
        <div className={app.vstack}>
          <div className={css.sheet_main}>
            <TABLE />
            <NewColumnButton />
          </div>
          <NewRowButton />
        </div>
      </div>
      {/* <DEBUGGER /> */}
    </SheetContextProvider>
  );
}

const DEBUGGER = () => {
  const { sheet } = useSheet();
  return (
    <div className={css.debug}>
      <pre>
        {JSON.stringify(sheet,null,4)}
      </pre>
    </div>
  );
};

const TOOLBAR = () => {
  return (
    <div className={css.sheet_toolbar}>
      <button children={"Sum"} />
      <EXPRINPUT />
    </div>
  );
};

const EXPRINPUT = () => {
  const [formula, setFormula] = useState("");
  return (
    <input
      type={"text"}
      value={formula}
      placeholder={"Expression"}
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

const TABLE = () => {
  const {
    rows,
    updateLastEditedCell,
    lastEditedCell,
    rowCount,
    colCount,
    cellmap,
    getSelectedCellIDs,
  } = useSheet();
  const tableRef = useRef<null | HTMLTableElement>(null);
  const mouseDown = useRef(false);
  const [
    primarySelectedID,
    setPrimarySelectedID,
  ] = useState<string | null>(null);
  const [isSelected, setSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [
    selectedCellIDs,
    setSelectedCellIDs,
  ] = useState<string[]>([]);
  const selectedCellSet = useMemo(() => {
    return new Set(selectedCellIDs);
  }, [selectedCellIDs]);
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
    if (tableElement === null) return;
    if (document.activeElement === document.body && isSelected) {
      tableElement.focus();
    }
  }, [isSelected]);
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement === null) return;
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
        updateLastEditedCell(lastID);
        setSelectedCellIDs([]);
        return;
      }
      if (primarySelectedID !== null && !targetOnControl(e.target as Html)) {
        setSelected(false);
        mouseDown.current = false;
        setPrimarySelectedID(null);
        setSelectedCellIDs([]);
        setIsEditing(false);
        updateLastEditedCell(null);
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (isEditing) return;
      if (!mouseDown.current) return;
      if (primarySelectedID === null) return;
      const pid = getCellID(e.target as Html);
      if (pid === null) return;
      if (pid === lastEditedCell.current) return;
      if (selectedCellIDs.length === 0) {
        tableElement.style.userSelect = "none";
      }
      const ids = getSelectedCellIDs(primarySelectedID, pid);
      setSelectedCellIDs(ids.length === 1 ? [] : ids);
      updateLastEditedCell(pid);
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
            <Fragment key={row.id + rowIndex}>
              {rowIndex === 0 && (
                <tr>
                  {range(0, colCount + 1).map((n, i) => (
                    <Fragment key={`ci${n}`}>
                      {i === 0
                        ? <th className={css.sheet_axis_cell} />
                        : (
                          <th className={css.sheet_axis_cell}>
                            {rebase(n - 1)}
                          </th>
                        )}
                    </Fragment>
                  ))}
                </tr>
              )}
              <tr>
                {row.cells.map((cell, columnIndex) => (
                  <Fragment key={cell.id + columnIndex}>
                    {columnIndex === 0 && (
                      <td className={css.sheet_axis_cell}>{rowIndex}</td>
                    )}
                    <CELL
                      type={cell.type}
                      value={cell.value}
                      id={cell.id}
                      rowIndex={rowIndex}
                      columnIndex={columnIndex}
                      isSelected={selectedCellSet.has(cell.id)}
                      isEditing={isEditing}
                      isPrimarySelected={primarySelectedID === cell.id}
                    />
                  </Fragment>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type pCELL = {
  type: CellType;
  value: string;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isPrimarySelected: boolean;
  isEditing: boolean;
  id: string;
};

const CELL = ({
  type,
  value,
  rowIndex,
  columnIndex,
  isSelected,
  isPrimarySelected,
  isEditing,
  id,
}: pCELL) => {
  const { updateValue } = useSheet();
  const [val, setVal] = useState(value);
  const [currentType, setCurrentType] = useState(type);
  const Box = currentType;

  useEffect(() => {
    isEditing && isPrimarySelected && updateValue(rowIndex, columnIndex, val);
  }, [val]);

  return (
    <Box
      data-id={id}
      tabIndex={-1}
      className={(currentType === "td" ? css.sheet_cell : css.sheet_header) +
        (isSelected ? " " + css.sheet_selected : "") +
        (isPrimarySelected ? " " + css.sheet_focus : "")}
    >
      <div className={css.sheet_cell_content}>
        {(isPrimarySelected && isEditing)
          ? <INPUT value={val} onWrite={setVal} />
          : <TEXT value={value} />}
        <MENU
          updateType={setCurrentType}
          type={type}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
        />
      </div>
    </Box>
  );
};

const TEXT = ({ value }: { value: string }) => (
  <div className={css.sheet_text + " " + css.sheet_readonly}>
    {value}
  </div>
);

type pINPUT = {
  value: string;
  onWrite: (feed: string) => void;
};
const INPUT = ({ value, onWrite }: pINPUT) => (
  <input
    value={value}
    onChange={(e) => onWrite(e.target.value)}
    autoFocus
    className={css.sheet_writable}
  />
);

type pMENU = {
  rowIndex: number;
  columnIndex: number;
  type: CellType;
  updateType: (type: CellType) => void;
};

const MENU = ({
  rowIndex,
  columnIndex,
  type,
  updateType,
}: pMENU) => {
  const { toggleType, push, pop, rowCount, colCount } = useSheet();
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
          updateType(type === "td" ? "th" : "td");
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
  const { pushColumn } = useSheet();
  return (
    <div className={css.sidecontrol}>
      <button className={css.new_col_button} onClick={pushColumn}>
        <div className={css.plus_button} />
      </button>
    </div>
  );
};

const NewRowButton = () => {
  const { pushRow } = useSheet();
  return (
    <div className={css.sidecontrol}>
      <button className={css.new_row_button} onClick={pushRow}>
        <div className={css.plus_button} />
      </button>
    </div>
  );
};
