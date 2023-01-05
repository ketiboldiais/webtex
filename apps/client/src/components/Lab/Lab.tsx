// hooks
import { useState } from 'react';
import { selectAllNotes, useAppDispatch } from '@model/store';

// components
import { Editor } from '@components/Editor/Editor';
import { Notelist } from './Notelist';
import { selectActiveNote, useAppSelector } from '@model/store';
import { useModal } from '@hooks/useModal';

// styles
import Styles from '@styles/Lab.module.css';
import { ControlBar } from './ControlBar';
import { Modal } from '@components/Modal';

export const Lab = () => {
  const activeNote = useAppSelector(selectActiveNote);
  const notes = useAppSelector(selectAllNotes);
  const { isOpen, toggle } = useModal();
  const [msg, setMsg] = useState('');
  const dispatch = useAppDispatch();

  const saveHandler = (title: string, content: string, wordcount: number) => {
    if (title === '') {
      setMsg(`To conserve your memory, Webtex doesn't save untitled notes.`);
      toggle();
    } else if (wordcount === 0) {
      setMsg(
        `To conserve your computer's memory, Webtex doesn't save empty notes.`
      );
      toggle();
    } else {
    }
  };

  return (
    <>
      <ControlBar />
      <article className={Styles.LabContainer}>
        <Notelist />
        <Editor init={activeNote} onSave={saveHandler} />
      </article>
      <Modal isOpen={isOpen} hide={toggle}>
        <p>{msg}</p>
      </Modal>
    </>
  );
};
