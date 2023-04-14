import { LexicalEditor } from "lexical";
import { Button, NumberInput } from "../Inputs";
import { useState } from "react";
import { INSERT_SHEET_COMMAND } from "./sheet.node";
import { makeRows } from "./sheet.type";

type ARGS = {
  activeEditor: LexicalEditor;
  onClose: () => void;
};

export function SheetPrompt({
  activeEditor,
  onClose,
}: ARGS) {
  const [colCount, setColCount] = useState(5);
  const [rowCount, setRowCount] = useState(5);

  const save = () => {
    activeEditor.dispatchCommand(INSERT_SHEET_COMMAND, {
      rows: makeRows(rowCount, colCount),
      minColCount: colCount,
      minRowCount: rowCount,
    });
    onClose();
  };

  return (
    <menu>
      <NumberInput nonnegative min={2} val={colCount} act={setColCount} />
      <NumberInput nonnegative min={2} val={rowCount} act={setRowCount} />
      <Button label={"Save"} click={save}/>
    </menu>
  );
}
