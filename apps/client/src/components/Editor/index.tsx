import Styles from "./Styles/Editor.module.css";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import Autofocus from "./plugins/Autofocus";
import Toolbar from "./Toolbar/Toolbar";
import { $getRoot, EditorState } from "lexical";
import { useEffect, useRef, useState } from "react";
import { EquationNode, MathPlugin } from "./plugins/Equation/Equation";
import { SaveButton } from "./Buttons/EditorButtons";
import theme from "./EditorTheme";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const editorConfig = {
  namespace: "Editor",
  theme,
  nodes: [EquationNode],
  onError(error: any) {
    throw error;
  },
};

interface editorProps {
  savehandler?: (content: string, title: string) => void;
  init?: any;
}

interface updateProps {
  value: string;
}

function UpdatePlugin({ value }: updateProps) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (value) {
      const initialEditorState = editor.parseEditorState(value);
      editor.setEditorState(initialEditorState);
    }
  }, [value, editor]);
  return <></>;
}

function Placeholder() {
  return <div className={Styles.EditorPlaceholder}></div>;
}

export function Editor({ savehandler, init }: editorProps) {
  const editorStateRef = useRef<EditorState | null>(null);
  const [title, setTitle] = useState("");
  const handleSave = (editorContent: string) => {
    if (savehandler && editorStateRef.current && title) {
      savehandler(editorContent, title);
    }
  };
  return (
    <LexicalComposer initialConfig={{ ...editorConfig }}>
      <div className={Styles.EditorContainer}>
        <input
          type="text"
          required
          placeholder="Title"
          className={Styles.TitleInput}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className={Styles.Toolbar}>
          <Toolbar />
          <SaveButton
            onClick={() => handleSave(JSON.stringify(editorStateRef.current))}
          />
        </div>
        <MathPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className={Styles.EditorInput} />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <UpdatePlugin value={init} />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              let root = $getRoot();
              if (root.getTextContent().length === 0) {
                editorStateRef.current = null;
              } else {
                editorStateRef.current = editorState;
              }
            });
          }}
          ignoreSelectionChange
        />
        <HistoryPlugin />
        <Autofocus />
      </div>
    </LexicalComposer>
  );
}
