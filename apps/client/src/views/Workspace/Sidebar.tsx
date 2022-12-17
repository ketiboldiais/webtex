import Styles from "./Styles/Sidebar.module.css";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import { DocList, NoteList } from "../../client";

interface SidebarProps {
  notes: NoteList;
  addNote: () => void;
  currentNote: any;
  setCurrentNote: Dispatch<SetStateAction<number>>;
  setActiveNote: (s: any) => void;
  deleteNote: (title: string) => void;
}

const Sidebar = ({
  notes,
  addNote,
  currentNote,
  setCurrentNote,
  setActiveNote,
  deleteNote,
}: SidebarProps) => {
  return (
    <div className={Styles.Sidebar}>
      <section className={Styles.SidebarHeader}>
        <h2>Notes</h2>
        <motion.div whileTap={{ translateY: 5 }}>
          <button className={Styles.NewNoteButton} onClick={addNote}>
            New Note
          </button>
        </motion.div>
      </section>
      {notes.map((note, index) => (
        <article
          className={`${Styles.SidebarNote} ${
            currentNote === index ? Styles.ActiveNote : ""
          }`}
          key={`${note.id}`}
          onClick={(event) => {
            event.stopPropagation();
            setActiveNote(index);
            setCurrentNote(index);
          }}
        >
          <section className={Styles.NoteHeader}>
            <strong className={Styles.SidebarNoteTitle}>{note.title}</strong>
            <button onClick={() => deleteNote(note.title)}></button>
          </section>
          <section>
            <small
              className={Styles.SidebarNoteMeta}
            >{`${note.modified}`}</small>
          </section>
        </article>
      ))}
    </div>
  );
};

export default Sidebar;
