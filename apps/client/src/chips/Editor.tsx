import app from "../ui/styles/App.module.scss";
import { useEditor } from "@hooks/useEditor";
import { useEffect, useRef, useState } from "react";
import { InputFn } from "src/App";
import {
  getActiveNote,
  makeNote,
  saveNote,
  useAppDispatch,
} from "src/state/state";
import { Children, EMPTY_NOTE } from "src/util";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorState, RootNode } from "lexical";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

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

type pEditor = {
  onSave: (content: string) => void;
};

export function Editor({ children, onSave }: pEditor & Children) {
  const doc = useRef<EditorState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const save = () => {
    const content = getContent(doc.current);
    onSave(content);
  };

  useEffect(() => {
    if (!isEditing && !isFirstRender) {
      save();
    }
  }, [isEditing]);

  return (
    <div className={app.page} onBlur={() => setIsEditing(false)}>
      <NodeEventPlugin
        nodeType={RootNode}
        eventType={"click"}
        eventListener={() => {
          save();
          setIsEditing(true);
          setIsFirstRender(false);
        }}
      />
      <OnChangePlugin
        onChange={(editorState) => doc.current = editorState}
      />
      {children}
    </div>
  );
}

type pTextPlugin = { className?: string };
export function TextPlugin({ className = app.pageContent }: pTextPlugin) {
  return (
    <RichTextPlugin
      contentEditable={
        <ContentEditable
          spellCheck={false}
          className={className}
        />
      }
      placeholder={null}
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
}
