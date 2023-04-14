import $ from "../ui/styles/App.module.scss";
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
import { ParametricPlotNode } from "./PlotParametric/parametric.node.js";
import { Plot3DNode } from "./Plot3d/plot3d.node.js";
import { SheetNode } from "./Sheet/sheet.node";
import { Plot2DNode } from "./Plot2d/plot2d.node";

const defaultConfig = {
  namespace: "editor",
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LatexNode,
    ImageNode,
    ParametricPlotNode,
    Plot3DNode,
    ExcalidrawNode,
    SheetNode,
    Plot2DNode,
  ],
  theme,
  onError(error: any) {
    throw error;
  },
  editorState: "",
  editable: true,
};

export function Workspace() {
  const activeNote = getActiveNote();
  defaultConfig.editorState = activeNote.content;

  return (
    <section className={$.main}>
      <LexicalComposer initialConfig={defaultConfig}>
        <EditorContextProvider>
          <SideBar />
          <Editor />
        </EditorContextProvider>
      </LexicalComposer>
    </section>
  );
}
