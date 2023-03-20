import S from "@styles/App.module.css";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { algom } from "./mathlang";
import { numToUpLatin } from "./mathlang/structs/stringfn";
import { InputFn } from "./App";
import { Scope } from "./mathlang/scope";
import { Interpreter } from "./mathlang/visitors/interpreter";
import { Compile } from "./mathlang/visitors/compiler";

type Cell = {
  row: number;
  column: string;
  value: string;
};
type RowCol = {
  row: number;
  column: string;
};
type SheetState = {
  [key: string]: string;
};

export function Sheet() {
  const scope = useRef(new Scope());
  const compiler = useRef(new Compile());
  const interpreter = useRef(new Interpreter());
  const [data, setData] = useState<SheetState>({} as SheetState);
  const [colCount, setColCount] = useState(7);
  const [rowCount, setRowCount] = useState(7);
  const setCellValue = useCallback(({ row, column, value }: Cell) => {
    const newData = { ...data };
    newData[`${column}${row}`] = value;
    setData(newData);
  }, [data, setData]);

  const evalCell = useCallback(({ row, column }: RowCol) => {
    const cellname = `${column}${row}`;
    const cellContent = data[cellname];
    if (cellContent) {
      if (cellContent.startsWith("=")) {
        const expr = `${cellname} ${cellContent}`;
        const parsing = algom.parse(expr).root;
        const result = interpreter.current.execBlock(parsing, scope.current);
        scope.current.define(cellname, result);
        return result.val;
      }
      const node = algom.parse(cellContent).root[0];
      scope.current.define(cellname, node);

      return cellContent;
    }
    return "";
  }, [data]);

  return (
    <div
      className={S.Spreadsheet}
      style={{
        display: "grid",
        gridTemplateColumns: `1fr repeat(${colCount - 1}, 10fr)`,
      }}
    >
      {[...Array(rowCount)].map((v, i) => {
        return (
          <Fragment key={`row${i}`}>
            {[...Array(colCount)].map((n, j) => {
              const colname = numToUpLatin(j - 1);
              return (
                <Cell
                  computeCell={evalCell}
                  rowIndex={i}
                  colIndex={j}
                  columnName={colname}
                  setCellValue={setCellValue}
                  currentValue={data[`${colname}${i}`]}
                  key={`${j}cell-${colname}${i}`}
                />
              );
            })}
          </Fragment>
        );
      })}
      <button
        onClick={() => setRowCount(rowCount + 1)}
        className={S.AddRowButton}
      >
        {"+"}
      </button>
      <button
        onClick={() => setColCount(colCount + 1)}
        className={S.AddColButton}
      >
        {"+"}
      </button>
    </div>
  );
}

interface CellProps {
  rowIndex: number;
  colIndex: number;
  columnName: string;
  setCellValue: ({ row, column, value }: Cell) => void;
  currentValue: string;
  computeCell: ({ row, column }: RowCol) => string;
}
function Cell(
  {
    rowIndex,
    colIndex,
    columnName,
    setCellValue,
    currentValue,
    computeCell,
  }: CellProps,
) {
  const [edit, setEdit] = useState(false);
  const value = useMemo(() => {
    if (edit) {
      return currentValue || "";
    }
    return computeCell({ row: rowIndex, column: columnName });
  }, [
    edit,
    currentValue,
    rowIndex,
    columnName,
  ]);

  const update: InputFn = useCallback((event) => {
    setCellValue({
      row: rowIndex,
      column: columnName,
      value: event.target.value,
    });
  }, [rowIndex, columnName, setCellValue]);

  if (colIndex === 0 && rowIndex === 0) {
    return <header></header>;
  }
  if (colIndex === 0) {
    return <header className={S.RowIndex}>{rowIndex}</header>;
  }
  if (rowIndex === 0) {
    return <header>{columnName}</header>;
  }

  return (
    <input
      value={value}
      title={`${columnName}${rowIndex}`}
      type={"text"}
      onBlur={() => setEdit(false)}
      onFocus={() => setEdit(true)}
      onChange={update}
    />
  );
}
