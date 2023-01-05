import Styles from '@styles/Notelist.module.css';
import { selectActiveNote, useAppSelector } from '@model/store';
import { selectAllNotes } from '@model/store';
import {
  RawNote,
  addNote,
  deleteNote,
  setActiveNote,
} from '@model/notes.slice';
import { useAppDispatch } from '@model/store';

export const Notelist = () => {
  const notes = useAppSelector(selectAllNotes);
  const activeNote = useAppSelector(selectActiveNote);

  const dispatch = useAppDispatch();

  const onNoteClicked = (index: number) => {
    dispatch(setActiveNote(index));
  };

  const onNewNoteClick = () => {};

  const onDeleteNoteClick = (index: number) => {
    dispatch(deleteNote(index));
  };

  const isActiveNote = (note: RawNote) => note.id === activeNote.id;

  const renderedNotes = notes.map((note, i) => (
    <li
      key={note.id}
      onClick={() => onNoteClicked(i)}
      className={isActiveNote(note) ? Styles.activeNote : ''}
    >
      <div className={Styles.NoteTitle}>
        <h3 className={note.unsaved ? Styles.UnsavedMark : ''}>
          {isActiveNote(note) ? activeNote.title : note.title}
        </h3>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDeleteNoteClick(i);
          }}
        >
          &times;
        </button>
      </div>
      <div>
        <small>{new Date(Date.parse(note.modified)).toLocaleString()}</small>
      </div>
    </li>
  ));
  return (
    <div className={Styles.Notelist}>
      <div className={Styles.Notelistheader}>
        <h2>Notes</h2>
        <button type='button' onClick={onNewNoteClick}>
          New
        </button>
      </div>
      <ul className={Styles.NotelistRows}>{renderedNotes}</ul>
    </div>
  );
};
