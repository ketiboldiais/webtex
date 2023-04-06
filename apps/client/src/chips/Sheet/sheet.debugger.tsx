import styles from "../../ui/styles/Editor.module.scss";
import { useRect } from "@hooks/useBoxSelect";
import { tree } from "src/algom/structs/stringfn";
import { useEffect, useMemo, useRef, useState } from "react";
import { Conditioned } from "../Inputs";
import { useCell, useSheet } from "./sheet.chip";

export function Debugger() {
  const {
    sheet,
    rowCount,
    columnCount,
    focusedCellID,
  } = useSheet();
  const {} = useCell();
  const { selection } = useRect();
  const show = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.sheet_debugger}>
      <div>
        <button
          onClick={() => {
            show.current = !show.current;
            setIsOpen(!isOpen);
          }}
        >
          {show.current ? "_" : "^"}
        </button>
      </div>
      <Conditioned on={isOpen}>
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
                SheetObject
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
            <tr>
              <td className={styles.sheet_debugger_heading} colSpan={2}>
                SheetContext
              </td>
            </tr>
            <tr>
              <td>RowCount:</td>
              <td>{rowCount}</td>
            </tr>
            <tr>
              <td>ColCount:</td>
              <td>{columnCount}</td>
            </tr>
            <tr>
              <td>focusedCellID</td>
              <td>{`${focusedCellID}`}</td>
            </tr>
            <tr>
              <td className={styles.sheet_debugger_heading} colSpan={2}>
                CellContext
              </td>
            </tr>
          </tbody>
        </table>
      </Conditioned>
    </div>
  );
}
