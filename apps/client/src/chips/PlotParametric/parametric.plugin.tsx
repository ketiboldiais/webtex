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
  $createParametricPlotNode,
  INSERT_PARAMETRIC_PLOT_COMMAND,
  ParametricPlotNode,
} from "./parametric.node";

export function ParametricPlotPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([ParametricPlotNode])) {
      throw new Error("ParametricPlotPlugin: ParametricPlotNode unregistered");
    }
    const insertPlot = command.priority.editor(
      INSERT_PARAMETRIC_PLOT_COMMAND,
      (payload) => {
        const node = $createParametricPlotNode(payload);
        $insertNodes([node]);
        if ($isRootOrShadowRoot(node.getParentOrThrow())) {
          $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertPlot));
  }, [editor]);
  return null;
}
