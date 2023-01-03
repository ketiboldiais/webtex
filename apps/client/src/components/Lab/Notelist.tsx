import Styles from '@styles/Notelist.module.css';
import { useAppSelector } from '@model/store';
import { selectAllNotes } from '@model/store';

export const Notelist = () => {
  const notes = useAppSelector(selectAllNotes);
  const renderedNotes = notes.array().map((note) => (
    <li key={note.modified.toDateString()}>
      <div className={Styles.NoteTitle}>
        <h3 className={note.unsaved ? Styles.UnsavedMark : ''}>{note.title}</h3>
        <button>&times;</button>
      </div>
      <div>{note.modified.toDateString()}</div>
    </li>
  ));
  return (
    <div className={Styles.Notelist}>
      <div className={Styles.Notelistheader}>
        <h2>Notes</h2>
        <button>New</button>
      </div>
      <ul className={Styles.NotelistRows}>{renderedNotes}</ul>
    </div>
  );
};
