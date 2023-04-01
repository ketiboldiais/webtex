import app from "../ui/styles/App.module.scss";
import { useEditor } from "@hooks/useEditor";
import { nanoid } from "nanoid";
import { useState } from "react";
import { BtnEvt, LiEvt } from "src/App";
import { Button } from "src/App";
import {
  addNote,
  deleteNote,
  getActiveNote,
  getNotes,
  makeNote,
  Note,
  setActiveNote,
  useAppDispatch,
} from "src/state/state";
import { concat, EMPTY_NOTE, toggle } from "src/util";
import { WriteIcon } from "./Icon";

export function SideBar() {
  const dispatch = useAppDispatch();
  let notes = getNotes();
  const { activeEditor } = useEditor();
  const active = getActiveNote();
  const [showNotes, setShowNotes] = useState(false);

  function createNote(event: BtnEvt) {
    event.stopPropagation();
    const title = ``;
    const id = nanoid(10);
    const newnote = makeNote(id, title, EMPTY_NOTE);
    dispatch(addNote(newnote));
    const newstate = activeEditor.parseEditorState(newnote.content);
    activeEditor.setEditorState(newstate);
  }

  function destroyNote(event: BtnEvt, note: Note) {
    event.stopPropagation();
    dispatch(deleteNote(note));
    if (note.id === active.id) {
      let ns = notes.filter((n) => n.id !== note.id);
      if (ns.length) {
        const newnote = ns[0];
        const newstate = activeEditor.parseEditorState(newnote.content);
        activeEditor.setEditorState(newstate);
      } else {
        const blank = activeEditor.parseEditorState(EMPTY_NOTE);
        activeEditor.setEditorState(blank);
      }
    }
  }
  return (
    <div className={app.sidebar}>
      <div className={app.notes_control}>
        <Button
          btnTitle="Add new note"
          label={<WriteIcon />}
          click={createNote}
          className={concat(app.defaultButton, app.write_button)}
        />
        <Button
          className={concat(app.defaultButton, app.formatBox, app.notesButton)}
          label={"Notes"}
          click={() => setShowNotes(!showNotes)}
        />
      </div>
      <ul className={`${app.notelist} ${showNotes ? app.visible : app.hidden}`}>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onDelete={destroyNote} />
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- NOTE ITEM ------------------------------- */
/**
 * Each note item in the sidebar is rendered as a NoteItem component.
 * Every note can be deleted except the documentation page.
 * This ensures that the note list is never empty, reducing the complexity
 * of keeping all the states in sync.
 */

interface INoteItem {
  note: Note;
  onDelete: (event: BtnEvt, note: Note) => void;
}
function NoteItem({ note, onDelete }: INoteItem) {
  const dispatch = useAppDispatch();
  const activeNote = getActiveNote();
  const { activeNoteTitle } = useEditor();
  const { activeEditor } = useEditor();
  function switchNote(event: LiEvt) {
    event.stopPropagation();
    dispatch(setActiveNote(note));
    const newstate = activeEditor.parseEditorState(note.content);
    activeEditor.setEditorState(newstate);
  }
  const noteTitle = note.id === activeNote.id ? activeNoteTitle : note.title;
  return (
    <li
      onClick={switchNote}
      className={concat(
        app.note,
        toggle(app.activeNote, app.note).on(note.id === activeNote.id),
      )}
    >
      <div className={app.note_header}>
        <strong>{noteTitle}</strong>
        {note.id !== `webtexDOCS` && (
          <button
            className={app.delete_button}
            onClick={(e) => onDelete(e, note)}
          >
            &times;
          </button>
        )}
      </div>
      <div className={app.note_details}>
        <small>{note.date}</small>
      </div>
    </li>
  );
}
