import Styles from '@styles/Notelist.module.css';
import {
  getActiveNote,
  getActiveNoteIndex,
  useAppSelector,
} from '@model/store';
import { selectAllNotes } from '@model/store';
import { addNote, deleteNote, setActiveNote } from '@model/notes.slice';
import { useAppDispatch } from '@model/store';

export const Notelist = () => {
  const notes = useAppSelector(selectAllNotes);
  const dispatch = useAppDispatch();
  const aidx = useAppSelector(getActiveNoteIndex);
  const renderedNotes = notes.map((note, i) => (
    <li
      key={note.id}
      className={i === aidx ? Styles.activeNote : ''}
      onClick={() => dispatch(setActiveNote(i))}
    >
      <div className={Styles.NoteTitle}>
        <h3>{note.title}</h3>
        <button
          onClick={(event) => {
            event.stopPropagation();
            dispatch(deleteNote(i));
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
        <button
          type='button'
          onClick={() => {
            dispatch(addNote());
            dispatch(setActiveNote(notes.length));
          }}
        >
          New
        </button>
      </div>
      <ul className={Styles.NotelistRows}>{renderedNotes}</ul>
    </div>
  );
};
