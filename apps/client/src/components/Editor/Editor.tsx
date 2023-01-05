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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { MathPlugin } from './plugins/Equation/Equation';
import { SaveButton } from './Buttons/EditorButtons';
import { UpdatePlugin } from './plugins/UpdatePlugin';
import { EditorConfig } from './EditorConfig';
import {
  RawNote,
  createEmptyNote,
  templateNote,
  updateTitle,
} from '@model/notes.slice';
import { useAppDispatch } from '@model/store';

function Placeholder() {
  return <div className={Styles.EditorPlaceholder}></div>;
}

export interface editorProps {
  init?: RawNote;
  activeNoteIndex: number;
  onSave: (title: string, content: string, wordcount: number) => void;
}

const countWords = (editor: EditorState | null) =>
  editor === null ? 0 : editor.read(() => $getRoot().getTextContentSize());

const getContent = (editor: EditorState | null) =>
  editor === null ? '' : JSON.stringify(editor);

export function Editor({ init, onSave, activeNoteIndex = -1 }: editorProps) {
  const doc = useRef<EditorState | null>(null);
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(init?.title ?? '');
  useEffect(() => {
    if (init) {
      setTitle(init.title);
    }
  }, [init]);
  const save = () => {
    onSave(title, getContent(doc.current), countWords(doc.current));
  };
  return (
    <div className={Styles.EditorContainer}>
      <input
        type='text'
        required
        placeholder={'untitled'}
        value={title}
        className={Styles.TitleInput}
        onChange={(event) => {
          setTitle(event.target.value);
          init && dispatch(updateTitle(event.target.value));
        }}
      />
      <LexicalComposer initialConfig={{ ...EditorConfig }}>
        <div>
          <div className={Styles.Toolbar}>
            <Toolbar />
            <SaveButton onClick={save} />
          </div>
          <MathPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className={Styles.EditorInput} />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <UpdatePlugin value={init ?? templateNote} />
          <OnChangePlugin
            onChange={(editorState) => (doc.current = editorState)}
            ignoreSelectionChange
          />
          <HistoryPlugin />
          <Autofocus />
        </div>
      </LexicalComposer>
    </div>
  );
}
