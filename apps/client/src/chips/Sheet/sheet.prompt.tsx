import { LexicalEditor } from "lexical";
import { Button, Card, Field, Form, NumberInput } from "../Inputs";
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
    <Form onSave={save}>
      <Card>
        <Field name={"Number of Columns"}>
          <NumberInput
            val={colCount}
            act={setColCount}
            allowFloat={false}
            nonnegative={true}
            max={500}
            min={2}
          />
        </Field>
        <Field name={"Number of Rows"}>
          <NumberInput
            val={rowCount}
            act={setRowCount}
            allowFloat={false}
            nonnegative={true}
            max={500}
            min={2}
          />
        </Field>
      </Card>
    </Form>
  );
}
