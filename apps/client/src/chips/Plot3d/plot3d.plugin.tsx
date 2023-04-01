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
  $createPlot3DNode,
  INSERT_PLOT3D_COMMAND,
  Plot3DNode,
} from "./plot3d.node";

export function Plot3DPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Plot3DNode])) {
      throw new Error("Plot3DPlugin: Plot3DNode unregistered.");
    }
    const insertPlot3d = command.priority.editor(
      INSERT_PLOT3D_COMMAND,
      (payload) => {
        const plot3dNode = $createPlot3DNode(payload);
        $insertNodes([plot3dNode]);
        if ($isRootOrShadowRoot(plot3dNode.getParentOrThrow())) {
          $wrapNodeInElement(plot3dNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertPlot3d));
  }, [editor]);
  return null;
}
