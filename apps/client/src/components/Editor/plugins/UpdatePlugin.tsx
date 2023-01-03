import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { RawNote } from '@model/notes.slice';

export interface updateProps {
  value: RawNote;
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
