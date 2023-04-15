import app from "../ui/styles/App.module.scss";
import { useEditor } from "@hooks/useEditor";
import { nanoid } from "nanoid";
import { Fragment, useState } from "react";
import { BtnEvt, LiEvt } from "src/App";
import {
  addNote,
  deleteNote,
  destroyNote,
  getActiveNote,
  getNotes,
  getTrashedNotes,
  makeNote,
  Note,
  setActiveNote,
  untrashNote,
  useAppDispatch,
} from "src/state/state";
import { Children, concat, EMPTY_NOTE, toggle } from "src/util";
import { Checkmark, TrashIcon, WriteIcon } from "./Icon";
import { useModal } from "@hooks/useModal";
import { Button } from "./Inputs";

type pSideBar = {
  notes: Note[];
  activeNote: Note;
  createNote(event: BtnEvt): void;
  destroyNote(event: BtnEvt, index: number): void;
  switchNote(event: LiEvt, index: number): void;
};
export function SideBar({
  notes,
  activeNote,
  createNote,
  destroyNote,
  switchNote,
}: pSideBar) {
  const [showNotes, setShowNotes] = useState(false);
  const [modal, showModal] = useModal();

  return (
    <div className={app.sidebar}>
      <div className={app.notes_control}>
        <Button
          btnTitle={"Add new note"}
          label={<WriteIcon />}
          click={createNote}
          className={concat(app.button, app.write_button)}
        />
        <Button
          btnTitle={"Recently deleted"}
          label={<TrashIcon />}
          click={() =>
            showModal((close) => <TrashedNotesList onClose={close} />)}
          className={concat(app.button, app.write_button)}
        />
        <Button
          className={concat(app.button, app.formatBox, app.notesButton)}
          label={"Notes"}
          click={() => setShowNotes(!showNotes)}
        />
      </div>
      <ul className={`${app.notelist} ${showNotes ? app.visible : app.hidden}`}>
        {notes.map((note, index) => (
          <li
            className={note.id === activeNote.id ? app.activeNote : app.note}
            onClick={(e) => switchNote(e, index)}
            key={note.id}
          >
            <NoteItem
              note={note}
              title={note.id === activeNote.id ? activeNote.title : note.title}
            >
              {note.id !== `webtexDOCS` && (
                <Button
                  className={app.delete_button}
                  click={(e) => destroyNote(e, index)}
                  label={"\u00d7"}
                />
              )}
            </NoteItem>
          </li>
        ))}
      </ul>
      {modal}
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
  title: string;
}
function NoteItem({ note, title, children }: INoteItem & Children) {
  return (
    <Fragment>
      <div className={app.note_header}>
        <strong>{title}</strong>
        {children}
      </div>
      <div className={app.note_details}>
        <small>{note.date}</small>
      </div>
    </Fragment>
  );
}

type pTrashNotesList = {
  onClose: () => void;
};

function TrashedNotesList({ onClose }: pTrashNotesList) {
  const dispatch = useAppDispatch();
  let notes = getTrashedNotes();
  const [notelist, setNotelist] = useState<Note[]>([]);
  const { activeEditor } = useEditor();

  const addToNoteList = (note: Note) => {
    setNotelist((notes) => [...notes, note]);
  };

  const removeFromNoteList = (note: Note) => {
    setNotelist((notes) => notes.filter((n) => n.id !== note.id));
  };

  const recoverNotes = () => {
    notelist.forEach((n) => {
      dispatch(addNote(n));
      dispatch(untrashNote(n));
    });
    const newstate = activeEditor.parseEditorState(
      notelist[notelist.length - 1].content,
    );
    activeEditor.setEditorState(newstate);
    onClose();
  };

  const destroyNotes = () => {
    notelist.forEach((n) => dispatch(destroyNote(n)));
    onClose();
  };

  return (
    <div>
      {notes.length > 0 && (
        <div className={app.comment_box}>
          <p>Destroyed notes cannot be recovered.</p>
        </div>
      )}
      <ul className={app.trashed_notes_list}>
        {notes.map((note) => (
          <TrashedNote
            key={note.id}
            note={note}
            onAdd={addToNoteList}
            onRemove={removeFromNoteList}
          />
        ))}
      </ul>
      <div className={app.action_footer}>
        <button
          disabled={notelist.length === 0}
          className={app.recover_button}
          onClick={recoverNotes}
        >
          Recover
        </button>
        <button
          disabled={notelist.length === 0}
          className={app.destroy_button}
          onClick={destroyNotes}
        >
          Destroy
        </button>
      </div>
    </div>
  );
}

type pTrashedNote = {
  note: Note;
  onAdd: (n: Note) => void;
  onRemove: (n: Note) => void;
};
function TrashedNote({
  note,
  onAdd,
  onRemove,
}: pTrashedNote) {
  const [checked, setChecked] = useState(false);
  return (
    <li className={app.trashed_note}>
      <div
        className={app.trashed_note_doc}
        onClick={() => {
          setChecked(!checked);
          (!checked ? onAdd : onRemove)(note);
        }}
      >
        <div
          className={app.trashed_note_title}
          children={note.title}
        />
        {checked && (
          <div className={app.trash_note_checkmark}>
            <Checkmark />
          </div>
        )}
      </div>
      <div className={app.trashed_note_date}>
        {note.date.slice(0, -10)}
      </div>
    </li>
  );
}
