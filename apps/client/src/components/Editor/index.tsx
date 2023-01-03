import Styles from './Styles/Editor.module.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import Autofocus from './plugins/Autofocus';
import Toolbar from './Toolbar/Toolbar';
import { $getRoot, EditorState } from 'lexical';
import { useRef, useState } from 'react';
import { MathPlugin } from './plugins/Equation/Equation';
import { SaveButton } from './Buttons/EditorButtons';
import { UpdatePlugin } from './plugins/UpdatePlugin';
import { EditorConfig } from './EditorConfig';
import { templateNote } from '@model/notes.slice';
import { RawNote } from '@model/notes.slice';

function Placeholder() {
  return <div className={Styles.EditorPlaceholder}></div>;
}

export interface editorProps {
  init?: RawNote;
  onSave: (title: string, content: string, wordcount: number) => void;
}

export function Editor({ init = templateNote, onSave }: editorProps) {
  const editorStateRef = useRef<EditorState | null>(null);
  const [title, setTitle] = useState(init.title);
  const [wordcount, setWordcount] = useState(0);
  const save = (content: string) => onSave(title, content, wordcount);

  return (
    <LexicalComposer initialConfig={{ ...EditorConfig }}>
      <div className={Styles.EditorContainer}>
        <input
          type='text'
          required
          placeholder={init.title}
          className={Styles.TitleInput}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className={Styles.Toolbar}>
          <Toolbar />
          <SaveButton
            onClick={() => save(JSON.stringify(editorStateRef.current))}
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
              setWordcount($getRoot().getTextContent().length);
              editorStateRef.current = editorState;
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
