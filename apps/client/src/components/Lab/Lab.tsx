// hooks
import { useState } from 'react';
import { getActiveNote, selectAllNotes, useAppDispatch } from '@model/store';
import { addNote, saveNote } from '@model/notes.slice';

// components
import { Editor } from '@components/Editor/Editor';
import { Notelist } from './Notelist';
import { useAppSelector } from '@model/store';
import { useModal } from '@hooks/useModal';

// styles
import Styles from '@styles/Lab.module.css';
import { ControlBar } from './ControlBar';
import { Modal } from '@components/Modal';

// messages
const NoTitle = "To conserve your memory, Webtex doesn't save untitled notes.";
const NoContent = "To conserve your memory, Webtex doesn't save empty notes.";

export const Lab = () => {
  let notes = useAppSelector(selectAllNotes);
  const activeNote = useAppSelector(getActiveNote);
  const { isOpen, toggle } = useModal();
  const [msg, warn] = useState('');
  const run = useAppDispatch();

  const saveHandler = (title: string, content: string, wc: number) => {
    if (title.length === 0) [() => warn(NoTitle), toggle].forEach((f) => f());
    else if (wc === 0) [() => warn(NoContent), toggle].forEach((f) => f());
    else if (!notes.length)
      [run(addNote()), run(saveNote(title, content))].forEach((f) => f);
    else run(saveNote(title, content));
  };

  return (
    <>
      <ControlBar />
      <article className={Styles.LabContainer}>
        <Notelist />
        <Editor
          onSave={saveHandler}
          init={activeNote}
          activeNoteIndex={notes.length}
        />
      </article>
      <Modal isOpen={isOpen} hide={toggle}>
        <p>{msg}</p>
      </Modal>
    </>
  );
};
