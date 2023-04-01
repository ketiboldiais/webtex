import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
} from "lexical";
import { useEffect } from "react";
import { command } from "src/util";
import { $createPlotNode, INSERT_PLOT_COMMAND, PlotNode } from "./plot2d.node";

export function PlotPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PlotNode])) {
      throw new Error(`PlotPlugin: PlotNode not registered on editor.`);
    }
    const insertPlot = command.priority.editor(
      INSERT_PLOT_COMMAND,
      (payload) => {
        const plotNode = $createPlotNode(payload);
        $insertNodes([plotNode]);
        if ($isRootOrShadowRoot(plotNode.getParentOrThrow())) {
          $wrapNodeInElement(plotNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertPlot));
  }, [editor]);
  return null;
}
