import app from "../ui/styles/App.module.scss";
import { ImagePlugin } from "./Image.js";
import { Plot3DPlugin } from "./Plot3d/plot3d.plugin.js";
import { useEditor } from "@hooks/useEditor";
import { useEffect, useRef, useState } from "react";
import { InputFn } from "src/App";
import {
  getActiveNote,
  makeNote,
  saveNote,
  useAppDispatch,
} from "src/state/state";
import { EMPTY_NOTE } from "src/util";
import { ExcalidrawPlugin } from "./Draw";
import { MarkdownPlugin } from "./Markdown";
import { ParametricPlotPlugin } from "./PlotParametric/parametric.plugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LatexPlugin } from "./Latex.js";
import { useAutosave } from "../hooks/useAutosave";
import { EditorState, RootNode } from "lexical";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ToolbarPlugin } from "./toolbar.plugin";
import { SheetPlugin } from "./Sheet/sheet.plugin";
import { Plot2DPlugin } from "./Plot2d/plot2d.plugin";

/* --------------------------------- EDITOR --------------------------------- */
/**
 * This is the actual text-editor component. It's a function that takes
 * no arguments.
 *
 * To minimize global dispatches, we don't save
 * on first render (because the displayed note
 * is already saved) and we don't save while
 * the user is typing (a user typing at
 * 90 WPM roughly translates to 7 dispatches every
 * second -- that's far too much). We accomplish this with
 * the useEffect hook below.
 *
 * If the user is editing, however, we will use autoSave
 * during brief pauses:
 */

function getContent(editor: EditorState | null) {
  return editor === null ? EMPTY_NOTE : JSON.stringify(editor);
}

export function Editor() {
  const dispatch = useAppDispatch();
  const doc = useRef<EditorState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { activeNoteId, activeNoteTitle } = useEditor();

  const save = () => {
    const content = getContent(doc.current);
    const note = makeNote(activeNoteId, activeNoteTitle, content);
    dispatch(saveNote(note));
  };

  useEffect(() => {
    if (!isEditing && !isFirstRender) save();
  }, [isEditing]);

  useAutosave({
    data: { activeNoteTitle, content: getContent(doc.current) },
    onSave: () => {
      if (!isEditing && !isFirstRender) save();
    },
  });

  return (
    <div className={app.doc}>
      <ToolbarPlugin />
      <div className={app.page} onBlur={() => setIsEditing(false)}>
        <NoteTitle onSave={save} />
        <HistoryPlugin />
        <TextPlugin />
        <NodeEventPlugin
          nodeType={RootNode}
          eventType={"click"}
          eventListener={() => {
            save();
            setIsEditing(true);
            setIsFirstRender(false);
          }}
        />
        <OnChangePlugin onChange={(editorState) => doc.current = editorState} />
        <ListPlugin />
        <LatexPlugin />
        <ImagePlugin />
        <Plot3DPlugin />
        <ParametricPlotPlugin />
        <ExcalidrawPlugin />
        <MarkdownPlugin />
        <SheetPlugin />
        <Plot2DPlugin />
      </div>
    </div>
  );
}

type pTextPlugin = { className?: string };
export function TextPlugin({ className = app.pageContent }: pTextPlugin) {
  return (
    <RichTextPlugin
      contentEditable={
        <ContentEditable spellCheck={false} className={className} />
      }
      placeholder={null}
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
}

/* ------------------------------- NOTE TITLE ------------------------------- */
/**
 * The note title is what links the editor to what's shown in the notelist
 * panel. We separate it from the editor because again, it isn't necessary
 * for the editor's functionality. When the input changes, the active note's
 * title in the notelist changes accordingly. Again, this is a nice feature,
 * but not necessary.
 */
type pNoteTitle = {
  onSave: () => void;
};
function NoteTitle({ onSave }: pNoteTitle) {
  const activeNote = getActiveNote();
  const [title, setTitle] = useState(activeNote.title);
  const { setActiveNoteTitle, setActiveNoteId } = useEditor();

  const updateTitle: InputFn = (event) => {
    setTitle(event.target.value);
  };

  useEffect(() => {
    setActiveNoteTitle(title);
  }, [title]);

  useEffect(() => {
    setTitle(activeNote.title);
    setActiveNoteId(activeNote.id);
  }, [activeNote]);

  return (
    <div className={app.docTitle}>
      <input
        type={"text"}
        value={title}
        placeholder={"Untitled"}
        onChange={updateTitle}
        onBlur={() => onSave()}
      />
    </div>
  );
}
