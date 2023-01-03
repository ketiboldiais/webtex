import Styles from '@styles/Notelist.module.css';
import { useAppSelector } from '@model/store';
import { selectAllNotes } from '@model/store';
import { addNote, deleteNote, setActiveNote } from '@model/notes.slice';
import { useAppDispatch } from '@model/store';

export const Notelist = () => {
  const notes = useAppSelector(selectAllNotes);
  const dispatch = useAppDispatch();
  const onNoteClicked = (index: number) => {
    dispatch(setActiveNote(index));
  };
  const onNewNoteClick = () => {
    dispatch(addNote());
  };
  const onDeleteNoteClick = (index: number) => {
    dispatch(deleteNote(index));
  };
  const renderedNotes = notes.map((note, i) => (
    <li key={note.id} onClick={() => onNoteClicked(i)}>
      <div className={Styles.NoteTitle}>
        <h3 className={note.unsaved ? Styles.UnsavedMark : ''}>{note.title}</h3>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDeleteNoteClick(i);
          }}
        >
          &times;
        </button>
      </div>
      <div>{new Date(note.modified).toDateString()}</div>
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
