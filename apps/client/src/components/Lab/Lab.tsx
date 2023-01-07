// hooks
import { useState } from 'react';
import {
  getActiveNote,
  getActiveNoteIndex,
  selectAllNotes,
  useAppDispatch,
} from '@model/store';
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
  const activeNoteIdx = useAppSelector(getActiveNoteIndex);

  const saveHandler = (title: string, content: string, wc: number) => {};

  return (
    <>
      {/* <ControlBar /> */}
      <article className={Styles.LabContainer}>
        <Notelist />
        <div className={Styles.Paper}>
          <Editor />
        </div>
      </article>
    </>
  );
};
