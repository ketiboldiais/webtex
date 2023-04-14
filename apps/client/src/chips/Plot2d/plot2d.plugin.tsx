import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createPlot2DNode,
  INSERT_PLOT_2D_COMMAND,
  Plot2DNode,
} from "./plot2d.node";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";

export function Plot2DPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Plot2DNode])) {
      throw new Error("Plot2dPlugin: Plot2DNode unregistered.");
    }
    return mergeRegister(editor.registerCommand(
      INSERT_PLOT_2D_COMMAND,
      (payload) => {
        const plot2dnode = $createPlot2DNode(payload);
        $insertNodes([plot2dnode]);
        if ($isRootOrShadowRoot(plot2dnode.getParentOrThrow())) {
          $wrapNodeInElement(plot2dnode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ));
  }, [editor]);
  return null;
}
