import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
} from "lexical";
import { useEffect } from "react";
import { command } from "src/util";
import {
  $createSpreadsheetNode,
  INSERT_SHEET_COMMAND,
  SpreadsheetNode,
} from "./sheet.node.js";

export function SheetPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([SpreadsheetNode])) {
      throw new Error("SheetPlugin: SpreadsheetNode unregistered.");
    }
    const insertSpreadsheet = command.priority.editor(
      INSERT_SHEET_COMMAND,
      ({ rows }) => {
        const node = $createSpreadsheetNode(rows);
        $insertNodes([node]);
        if ($isRootOrShadowRoot(node.getParentOrThrow())) {
          $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertSpreadsheet));
  }, [editor]);

  return null;
}
