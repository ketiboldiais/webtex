import Styles from './Styles/Editor.module.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useAutosave } from '@hooks/useAutosave';
import Autofocus from './plugins/Autofocus';
import Toolbar from './Toolbar/Toolbar';
import { $getRoot, EditorState, RootNode } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { MathPlugin } from './plugins/Equation/Equation';
import { SaveButton } from './Buttons/EditorButtons';
import { UpdatePlugin } from './plugins/UpdatePlugin';
import { EditorConfig } from './EditorConfig';
import {
  addNote,
  createEmptyNote,
  saveNote,
  templateNote,
  updateTitle,
} from '@model/notes.slice';
import {
  getActiveNote,
  getActiveNoteIndex,
  selectAllNotes,
  useAppDispatch,
  useAppSelector,
} from '@model/store';

function Placeholder() {
  return <div className={Styles.EditorPlaceholder}></div>;
}

const countWords = (editor: EditorState | null) =>
  editor === null ? 0 : editor.read(() => $getRoot().getTextContentSize());

const getContent = (editor: EditorState | null) =>
  editor === null ? '' : JSON.stringify(editor);

export function Editor() {
  const doc = useRef<EditorState | null>(null);
  const activeNote = useAppSelector(getActiveNote);
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(activeNote ? activeNote.title : '');
  const [isEditing, setIsEditing] = useState(false);
  const notes = useAppSelector(selectAllNotes);
  const aidx = useAppSelector(getActiveNoteIndex);
  useEffect(() => {
    if (notes.length !== 0) dispatch(updateTitle(title));
  }, [title]);
  useEffect(() => {
    setTitle(activeNote.title);
  }, [aidx]);
  const save = () => {
    if (notes.length === 0) {
      dispatch(addNote(createEmptyNote(title, getContent(doc.current))));
      // dispatch(saveNote(title, getContent(doc.current)));
    }
    if (!isEditing) {
      dispatch(saveNote(title, getContent(doc.current)));
      if (activeNote.title !== '') setTitle(activeNote.title);
    }
  };
  useAutosave({
    data: { title, content: getContent(doc.current) },
    onSave: save,
  });
  return (
    <div className={Styles.EditorContainer}>
      <input
        type='text'
        required
        placeholder={'untitled'}
        value={activeNote && notes.length !== 0 ? activeNote.title : title}
        className={Styles.TitleInput}
        onBlur={() => {
          if (notes.length !== 0) {
            dispatch(updateTitle(title));
          }
        }}
        onChange={(event) => {
          setIsEditing(true);
          setTitle(event.target.value);
        }}
      />
      <LexicalComposer initialConfig={{ ...EditorConfig }}>
        <div onBlur={() => setIsEditing(false)}>
          <div className={Styles.Toolbar}>
            <Toolbar />
            <SaveButton
              onClick={(ev) => {
                ev.stopPropagation();
                save();
              }}
            />
          </div>
          <MathPlugin />
          <HistoryPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className={Styles.EditorInput} />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <UpdatePlugin value={activeNote ? activeNote : templateNote} />
          <NodeEventPlugin
            nodeType={RootNode}
            eventType='click'
            eventListener={(_) => setIsEditing(true)}
          />
          <OnChangePlugin
            onChange={(editorState) => (doc.current = editorState)}
            ignoreSelectionChange
            ignoreHistoryMergeTagChange
          />
          <Autofocus />
        </div>
      </LexicalComposer>
    </div>
  );
}
