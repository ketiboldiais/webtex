import css from "../../ui/styles/App.module.scss";
import { getCellID, targetOnControl } from "./sheet.aux";
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
import { latinize, range } from "@webtex/algom";
import { Children, Html } from "src/util";
import { Dropdown, Option } from "../Dropdown";
import { Chevron } from "../Icon";
import { InputFn } from "src/App";
import {
  Cell,
  CellMap,
  CellType,
  makeRows,
  Rows,
  Spreadsheet,
} from "./sheet.type";
import { Button } from "../Inputs";
import { useEditor } from "@hooks/useEditor";
import { INSERT_SHEET_COMMAND } from "./sheet.node";
import { INSERT_PLOT_2D_COMMAND } from "../Plot2d/plot2d.node";
import { defaults } from "../Plot2d/plot2d.chip";
import { DEFAULT_SVG_HEIGHT, DEFAULT_SVG_WIDTH } from "../PlotUtils";

type CellFn = (rowIndex: number, colIndex: number, value: string) => void;
type pSheet = {
  minRowCount?: number;
  minColCount?: number;
  initialRows?: Rows;
};

export default function Sheet({
  minRowCount = 5,
  minColCount = 5,
  initialRows = makeRows(minRowCount, minColCount),
}: pSheet) {
  const sheet = useRef(Spreadsheet.preload(initialRows));

  return (
    <div className={css.sheetShell}>
      <TableContextProvider sheet={sheet}>
        <CONTROL>
          <TABLE />
        </CONTROL>
      </TableContextProvider>
    </div>
  );
}

function CONTROL({ children }: Children) {
  const { activeEditor } = useEditor();
  if (activeEditor === undefined || activeEditor === null) {
    return <>{children}</>;
  }
  const {
    pushColumn,
    pushRow,
    setSelectedCellIDs,
    sheet,
    bindColumns,
  } = useTable();

  const push = (type: "column" | "row") => () => {
    setSelectedCellIDs([]);
    sheet.updateSelection([]);
    type === "column" ? pushColumn() : pushRow();
  };

  const setColumnTypes = () => {
    // bindColumns(["a", "b", "c"]);
    // activeEditor.dispatchCommand(INSERT_PLOT_2D_COMMAND, {
      // functions: defaults,
      // domain: [-10, 10],
      // range: [-10, 10],
      // width: DEFAULT_SVG_WIDTH,
      // height: DEFAULT_SVG_HEIGHT,
      // ticks: 10,
      // samples: 170,
    // });
  };

  return (
    <Fragment>
      <menu>
        <Button click={push("column")} label={"Add column"} />
        <Button click={push("row")} label={"Add row"} />
        <Button click={setColumnTypes} label={"Plot 2D"} />
      </menu>
      {children}
    </Fragment>
  );
}

type pSheetContext = {
  children: ReactNode;
  sheet: React.MutableRefObject<Spreadsheet>;
};

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
  bindColumns: (data: string[]) => void;
};
const TableContext = createContext<SheetState>({} as SheetState);
function TableContextProvider({
  children,
  sheet,
}: pSheetContext) {
  const [rowCount, setRowCount] = useState(sheet.current.rowCount);
  const [colCount, setColCount] = useState(sheet.current.columnCount);
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
  const [, setCurrentFocusedCell] = useState<string | null>(null);
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
    if (startPos === undefined) {
      return null;
    }
    const endPos = cellmap.get(endID);
    if (endPos === undefined) {
      return null;
    }
    const startX = Math.min(startPos[0], endPos[0]);
    const endX = Math.max(startPos[0], endPos[0]);
    const startY = Math.min(startPos[1], endPos[1]);
    const endY = Math.max(startPos[1], endPos[1]);
    return { startX, startY, endX, endY };
  };

  const getSelectedCellIDs = (startID: string, endID: string) => {
    const rect = getSelectedRect(startID, endID);
    if (rect === null) {
      return [];
    }
    const { startX, startY, endX, endY } = rect;
    const ids: Cell[] = [];
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const cell = sheet.current.getCellAt(x, y);
        if (cell === null) {
          continue;
        }
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

  const bindColumns = (data: string[]) => {
    push("row", 0);
    sheet.current.bindColumns(0, data);
    setRowCount(rowCount + 1);
  };

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
        bindColumns,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

const useTable = () => useContext(TableContext);

function TABLE({ children }: Children) {
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
    <div className={css.sheet}>
      <table className={css.table} ref={tableRef} tabIndex={-1}>
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
                        {primarySelectedID === cell.id && <MENU />}
                      </CELL>
                    </CellProvider>
                  </Column>
                ))}
              </tr>
            </RowIndex>
          ))}
        </tbody>
      </table>
      {children}
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
      className={(type === "td" ? css.normalCell : css.headerCell) +
        (isSelected ? " " + css.selected : "") +
        (isPrimarySelected ? " " + css.focus : "")}
    >
      <div className={css.cellbody}>
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
      <div className={css.cellText + " " + css.cellReadonly}>
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
        className={css.cellWritable}
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
      containerClass={css.cellmenu}
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
