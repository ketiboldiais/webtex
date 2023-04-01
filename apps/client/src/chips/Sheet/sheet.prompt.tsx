import { useState } from "react";
import { NumberInput } from "../Inputs";
import app from "../../ui/styles/App.module.scss";
import { LexicalEditor } from "lexical";
import { INSERT_SHEET_COMMAND } from "./sheet.node";
import { makeRows } from "./sheet.aux";

type pSheetPrompt = {
  activeEditor: LexicalEditor;
  onClose: () => void;
};

export function SheetPrompt({ activeEditor, onClose }: pSheetPrompt) {
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(5);

  const setColCount = (colCount: number) => {
    setCols(0 < colCount && colCount < 100 ? colCount : cols);
  };

  const setRowCount = (rowCount: number) => {
    setRows(0 < rowCount && rowCount < 100 ? rowCount : rows);
  };

  const save = () => {
    activeEditor.dispatchCommand(INSERT_SHEET_COMMAND, {
      rows: makeRows(cols, rows),
    });
    onClose();
  };

  return (
    <div className={app.sheet_prompt}>
      <div className={app.sheet_prompt_row}>
        <label>Columns</label>
        <NumberInput onChange={setColCount} value={cols} />
      </div>
      <div className={app.sheet_prompt_row}>
        <label>Rows</label>
        <NumberInput onChange={setRowCount} value={rows} />
      </div>
      <button onClick={save} className={app.modal_save}>Save</button>
    </div>
  );
}
