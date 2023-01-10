import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { Note } from '@model/notes.api';

export interface updateProps {
  value: Note;
}

export function UpdatePlugin({ value }: updateProps) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (value) {
      const initialEditorState = editor.parseEditorState(value.content);
      editor.setEditorState(initialEditorState);
    }
  }, [value, editor]);
  return <></>;
}
