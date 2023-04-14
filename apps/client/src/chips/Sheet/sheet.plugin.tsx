import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createSheetNode,
  INSERT_SHEET_COMMAND,
  SheetNode,
} from "./sheet.node";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";

export function SheetPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([SheetNode])) {
      throw new Error("SheetPlugin: SheetNode unregisterd.");
    }
    return mergeRegister(editor.registerCommand(
      INSERT_SHEET_COMMAND,
      (payload) => {
        const node = $createSheetNode(payload);
        $insertNodes([node]);
        if ($isRootOrShadowRoot(node.getParentOrThrow())) {
          $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ));
  }, [editor]);
  return null;
}
