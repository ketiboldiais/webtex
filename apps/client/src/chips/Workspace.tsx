import app from "../ui/styles/App.module.scss";
import { EditorContextProvider } from "@hooks/useEditor";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SideBar } from "src/chips/Sidebar";
import { getActiveNote } from "src/state/state";
import { Editor } from "./Editor";
import { theme } from "./EditorConfig";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ExcalidrawNode } from "./Draw";
import { ImageNode } from "./Image";
import { LatexNode } from "./Latex";
import { PlotNode } from "./Plot2d";
import { ParametricPlotNode } from "./PlotParametric/parametric.node.js";
import { Plot3DNode } from "./Plot3d/plot3d.node.js";

export function Workspace() {
  const activeNote = getActiveNote();
  const defaultConfig = {
    namespace: "editor",
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LatexNode,
      ImageNode,
      PlotNode,
      ParametricPlotNode,
      Plot3DNode,
      ExcalidrawNode,
    ],
    theme,
    onError(error: any) {
      throw error;
    },
    editorState: activeNote.content,
    editable: true,
  };

  return (
    <section className={app.main}>
      <LexicalComposer initialConfig={defaultConfig}>
        <EditorContextProvider>
          <SideBar />
          <Editor />
        </EditorContextProvider>
      </LexicalComposer>
    </section>
  );
}
