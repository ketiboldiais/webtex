import app from "../ui/styles/App.module.scss";
import { EditorContextProvider, useEditor } from "@hooks/useEditor";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SideBar } from "src/chips/Sidebar";
import {
  addNote,
  deleteNote,
  getActiveNote,
  getNotes,
  makeNote,
  saveNote,
  setActiveNote,
  setActiveNoteTitle,
  useAppDispatch,
} from "src/state/state";
import { Editor, TextPlugin } from "./Editor";
import { theme } from "./EditorConfig";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ExcalidrawNode, ExcalidrawPlugin } from "./Draw";
import { ImageNode, ImagePlugin } from "./Image";
import { LatexNode, LatexPlugin } from "./Latex";
import { ParametricPlotNode } from "./PlotParametric/parametric.node.js";
import { Plot3DNode } from "./Plot3d/plot3d.node.js";
import { SheetNode } from "./Sheet/sheet.node";
import { Plot2DNode } from "./Plot2d/plot2d.node";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownPlugin } from "./Markdown";
import { Plot2DPlugin } from "./Plot2d/plot2d.plugin";
import { Plot3DPlugin } from "./Plot3d/plot3d.plugin";
import { ParametricPlotPlugin } from "./PlotParametric/parametric.plugin";
import { SheetPlugin } from "./Sheet/sheet.plugin";
import { Children, EMPTY_NOTE } from "src/util";
import { ToolbarPlugin } from "./toolbar.plugin";
import { nanoid } from "nanoid";
import { BtnEvt, LiEvt } from "src/App";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { RootNode } from "lexical";

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
    editorState: activeNote.content,
    editable: true,
  };

  return (
    <LexicalComposer initialConfig={defaultConfig}>
      <EditorContextProvider>
        <Main />
      </EditorContextProvider>
    </LexicalComposer>
  );
}

function Main() {
  const dispatch = useAppDispatch();
  const notes = getNotes();
  const activeNote = getActiveNote();
  const { activeEditor } = useEditor();
  function createNote(event: BtnEvt) {
    event.stopPropagation();
    const title = ``;
    const id = nanoid(10);
    const newnote = makeNote(id, title, EMPTY_NOTE);
    dispatch(addNote(newnote));
    const newstate = activeEditor.parseEditorState(newnote.content);
    activeEditor.setEditorState(newstate);
  }

  function destroyNote(event: BtnEvt, index: number) {
    event.stopPropagation();
    const note = notes[index];
    dispatch(deleteNote(note));
    if (note.id === activeNote.id) {
      let ns = notes.filter((n) => n.id !== note.id);
      if (ns.length) {
        const newnote = ns[0];
        const newstate = activeEditor.parseEditorState(newnote.content);
        activeEditor.setEditorState(newstate);
      } else {
        const blank = activeEditor.parseEditorState(EMPTY_NOTE);
        activeEditor.setEditorState(blank);
      }
    }
  }

  function switchNote(event: LiEvt, index: number) {
    event.stopPropagation();
    const note = notes[index];
    dispatch(setActiveNote(note));
    const newstate = activeEditor.parseEditorState(note.content);
    activeEditor.setEditorState(newstate);
  }

  const save = (content: string) => {
    const note = makeNote(activeNote.id, activeNote.title, content);
    dispatch(saveNote(note));
  };

  return (
    <section className={app.main}>
      <SideBar
        notes={notes}
        activeNote={activeNote}
        createNote={createNote}
        destroyNote={destroyNote}
        switchNote={switchNote}
      />
      <Doc>
        <ToolbarPlugin />
        <Editor onSave={save}>
          <NodeEventPlugin
            nodeType={RootNode}
            eventType={"keydown"}
            eventListener={(_, editor) => {
              editor.registerTextContentListener((title) => {
                if (title.length < 30) {
                  dispatch(setActiveNoteTitle({ id: activeNote.id, title }));
                }
              });
            }}
          />
          <HistoryPlugin />
          <TextPlugin />
          <ListPlugin />
          <LatexPlugin />
          <ImagePlugin />
          <Plot3DPlugin />
          <ParametricPlotPlugin />
          <ExcalidrawPlugin />
          <MarkdownPlugin />
          <SheetPlugin />
          <Plot2DPlugin />
        </Editor>
      </Doc>
    </section>
  );
}

function Doc({ children }: Children) {
  return (
    <div className={app.doc}>
      {children}
    </div>
  );
}
