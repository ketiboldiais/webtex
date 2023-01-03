import { Editor } from '@components/Editor';
import { Notelist } from './Notelist';
import { selectActiveNote, useAppSelector } from '@model/store';
import { useState } from 'react';

// styles
import Styles from '@styles/Lab.module.css';
import { ControlBar } from './ControlBar';

export const Lab = () => {
  const activeNote = useAppSelector(selectActiveNote);
  const saveHandler = (title: string, content: string, wordcount: number) => {
    console.table([title, content, wordcount]);
  };

  return (
    <>
      <ControlBar />
      <article className={Styles.LabContainer}>
        <Notelist />
        <Editor init={activeNote} onSave={saveHandler} />
      </article>
    </>
  );
};
