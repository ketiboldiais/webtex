import { CSSProperties, useMemo } from "react";
import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, InputFn } from "src/App.js";
import { Rows, Spreadsheet } from "./sheet.aux.js";
import { Row } from "./sheet.aux.js";
import styles from "../../ui/styles/Editor.module.scss";
import { NodeKey } from "lexical/LexicalNode.js";
import {
  SelectionContextProvider,
  useRect,
  useSelect,
} from "@hooks/useBoxSelect.js";
import { Cell } from "./sheet.aux.js";
import { tree } from "src/algom/structs/stringfn.js";
import { concat, joinRest, strung } from "src/util/index.js";
import { Conditioned } from "../Inputs.js";

function css(x: CSSProperties): CSSProperties {
  return (x);
}

const styleTog = (A: CSSProperties, B: CSSProperties) => ({
  on: (selected: boolean) => selected ? A : B,
});

type SheetCtxShape = {
  cols: number;
  setCols: Dispatch<SetStateAction<number>>;
  rows: number;
  setRows: Dispatch<SetStateAction<number>>;
  sheet: MutableRefObject<Spreadsheet>;
  addRow: () => void;
  addCol: () => void;
  getRowAt: (rowIndex: number) => Row;
  update: (x: string, rowIndex: number, colIndex: number) => void;
  selectedCells: Cell[];
  setSelectedCells: Dispatch<SetStateAction<Cell[]>>;
  selectCell: (cell: Cell) => void;
  editing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  devmode: boolean;
  lastUpdatedCellID: string;
};

const SheetContext = createContext<SheetCtxShape>({} as SheetCtxShape);

type CtxProps = {
  children: ReactNode;
  initialRows: Rows;
  devmode: boolean;
};

export function SheetContextProvider(
  { children, initialRows, devmode }: CtxProps,
) {
  const sheet = useRef(Spreadsheet.preload(initialRows));
  const [cols, setCols] = useState(sheet.current.__colCount);
  const [rows, setRows] = useState(sheet.current.__rowCount);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [editing, setIsEditing] = useState(false);
  const [lastUpdatedCellID, setLastUpdatedCellID] = useState(
    sheet.current.lastUpdatedCellID,
  );

  const update = (newValue: string, rowIndex: number, colIndex: number) => {
    sheet.current.updateCellValue(rowIndex, colIndex, newValue);
    if (editing) return;
    setLastUpdatedCellID(sheet.current.lastUpdatedCellID);
  };

  const getRowAt = (rowIndex: number) => sheet.current.rows[rowIndex];

  const addCol = () => {
    sheet.current.pushCol();
    setCols((cols) => cols + 1);
  };

  const selectCell = (cell: Cell) => {
    setSelectedCells([...selectedCells, cell]);
  };

  const addRow = () => {
    sheet.current.pushRow();
    setRows((rows) => rows + 1);
  };

  const value = {
    cols,
    setCols,
    rows,
    setRows,
    update,
    addCol,
    addRow,
    sheet,
    getRowAt,
    selectedCells,
    setSelectedCells,
    selectCell,
    editing,
    setIsEditing,
    devmode,
    lastUpdatedCellID,
  };

  return (
    <SheetContext.Provider value={value}>
      {children}
    </SheetContext.Provider>
  );
}

export const useSheet = () => useContext(SheetContext);

type pSheet = {
  rows: Rows;
  devmode?: boolean;
  nodeKey?: NodeKey;
};

export default function Sheet({ rows, devmode = false }: pSheet) {
  return (
    <SheetContextProvider devmode={devmode} initialRows={rows}>
      <SelectionContextProvider>
        <MAIN />
      </SelectionContextProvider>
    </SheetContextProvider>
  );
}

function MAIN() {
  const { cref } = useRect();
  const { devmode } = useSheet();
  return (
    <>
      <div ref={cref} className={styles.spreadsheet}>
        <TOOLBAR />
        <BODY />
      </div>
      {devmode && <Debugger />}
    </>
  );
}

const test = () => (m: string) => console.log(m);
function TOOLBAR() {
  const { addCol, addRow } = useSheet();
  return (
    <div className={styles.table_toolbar}>
      <Button className={styles.table_button} label={"add column"} click={addCol} />
      <Button className={styles.table_button} label={"add row"} click={addRow} />
    </div>
  );
}

function BODY() {
  const { sheet } = useSheet();
  const rows = sheet
    .current
    .rows
    .map((row, r) => <ROW key={row.id} rowIndex={r} />);
  return (
    <table className={styles.table}>
      <tbody>{rows}</tbody>
    </table>
  );
}

type pROW = {
  rowIndex: number;
};

function ROW({ rowIndex }: pROW) {
  const { getRowAt } = useSheet();
  const cells = getRowAt(rowIndex)
    .cells
    .map((cell, colIndex) => (
      <CELL
        key={cell.id}
        colIndex={colIndex}
        rowIndex={rowIndex}
        cell={cell}
      />
    ));
  return <tr>{cells}</tr>;
}

type pCELL = { colIndex: number; rowIndex: number; cell: Cell };

function CELL({ colIndex, rowIndex, cell }: pCELL) {
  const { editing } = useSheet();
  const ref = useRef(null);
  const { selection } = useRect();
  const selected = useSelect(ref, selection);

  const classname = useMemo(() =>
    strung([
      styles.table_cell,
      styles.table_cell_selected,
    ]).tailIf(selected), [selected]);
  return (
    <td className={classname} ref={ref}>
      <CONTENT
        id={cell.id}
        value={cell.value}
        colIndex={colIndex}
        rowIndex={rowIndex}
      />
    </td>
  );
}

type pContent = {
  id: string;
  value: string;
  rowIndex: number;
  colIndex: number;
};
function CONTENT({ id, value, rowIndex, colIndex }: pContent) {
  const [isEditMode, setIsEditMode] = useState(false);
  const inputRef = useRef(null);
  const { setIsEditing, update } = useSheet();
  const [val, setVal] = useState(value);

  const updateValue: InputFn = (e) => {
    e.stopPropagation();
    setVal(e.target.value);
    update(e.target.value, rowIndex, colIndex);
  };

  const write = () => {
    setIsEditMode(true);
    setIsEditing(true);
  };
  const read = () => {
    setIsEditMode(false);
    setIsEditing(false);
  };

  const onClickOut = (event: MouseEvent) => {
    if ((event.target as HTMLElement)?.dataset?.cellId !== id) {
      read();
    }
  };

  useEffect(() => {
    document.addEventListener("click", onClickOut);
    return () => document.removeEventListener("click", onClickOut);
  }, []);

  return isEditMode
    ? (
      <input
        value={val}
        onChange={updateValue}
        autoFocus
        ref={inputRef}
        data-cell-id={id}
      />
    )
    : (
      <div
        className={styles.table_cell_content}
        data-cell-id={id}
        onClick={write}
      >
        {`${val}`}
      </div>
    );
}

function Debugger() {
  const { sheet } = useSheet();
  const { selection } = useRect();
  const [show, setShow] = useState(false);

  return (
    <div className={styles.sheet_debugger}>
      <div>
        <button onClick={() => setShow(!show)}>
          {show ? "_" : "^"}
        </button>
      </div>
      <Conditioned on={show}>
        <div className={styles.json_window}>
          {tree(sheet.current)}
        </div>
        <table>
          <tbody>
            <tr>
              <td className={styles.sheet_debugger_heading} colSpan={2}>
                DOMRect
              </td>
            </tr>
            <tr>
              <td>height</td>
              <td>{selection?.height ?? "null"}</td>
            </tr>
            <tr>
              <td>width</td>
              <td>{selection?.width ?? "null"}</td>
            </tr>
            <tr>
              <td>x</td>
              <td>{selection?.x ?? "null"}</td>
            </tr>
            <tr>
              <td>y</td>
              <td>{selection?.y ?? "null"}</td>
            </tr>
            <tr>
              <td className={styles.sheet_debugger_heading} colSpan={2}>
                Sheet
              </td>
            </tr>
            <tr>
              <td>rowCount</td>
              <td>{sheet.current.__rowCount}</td>
            </tr>
            <tr>
              <td>colCount</td>
              <td>{sheet.current.__colCount}</td>
            </tr>
          </tbody>
        </table>
      </Conditioned>
    </div>
  );
}
