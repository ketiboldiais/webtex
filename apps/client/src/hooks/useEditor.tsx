import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { getActiveNote } from "src/state/state";

interface IEditorContext {
  initEditor: LexicalEditor;
  activeEditor: LexicalEditor;
  activeNoteId: string;
  setActiveNoteId: Dispatch<SetStateAction<string>>;
  activeNoteTitle: string;
  setActiveEditor: Dispatch<SetStateAction<LexicalEditor>>;
  setActiveNoteTitle: Dispatch<SetStateAction<string>>;
}
export function EditorContextProvider({ children }: { children: ReactNode }) {
  const activeNote = getActiveNote();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [activeNoteId, setActiveNoteId] = useState(activeNote.id);
  const [activeNoteTitle, setActiveNoteTitle] = useState(activeNote.title);

  const value: IEditorContext = {
    initEditor: editor,
    activeEditor,
    setActiveEditor,
    activeNoteId,
    setActiveNoteId,
    activeNoteTitle,
    setActiveNoteTitle,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}
export const EditorContext = createContext<IEditorContext>(
  {} as IEditorContext,
);
export const useEditor = () => useContext(EditorContext);
