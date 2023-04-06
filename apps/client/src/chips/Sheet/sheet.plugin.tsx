import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from "lexical";
import { useEffect } from "react";
import { CellEditorConfig, useSheet } from "./sheet.component.js";
import {
  $createSpreadsheetNode,
  INSERT_SHEET_COMMAND,
  SpreadsheetNode,
} from "./sheet.node.js";

type Props = {
  config: CellEditorConfig;
  children: JSX.Element | JSX.Element[];
};

export function SpreadsheetPlugin({ config, children }: Props) {
  const [editor] = useLexicalComposerContext();
  const { set } = useSheet();

  useEffect(() => {
    if (!editor.hasNodes([SpreadsheetNode])) {
      throw new Error("SheetPlugin: SpreadsheetNode unregistered.");
    }
    set(config, children);
    return editor.registerCommand(
      INSERT_SHEET_COMMAND,
      ({ rows }) => {
        const node = $createSpreadsheetNode(rows);
        $insertNodes([node]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, config, children]);
  return null;
}
