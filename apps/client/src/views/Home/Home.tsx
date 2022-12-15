import { motion } from "framer-motion";

// hooks
import { useState } from "react";

// styles
import Styles from "./Styles/Home.module.css";
import { Editor } from "../../components/Editor";

// components
import Sidebar from "./Sidebar";

const defaultcontent = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

const defaultNote = {
  title: "",
  content: defaultcontent,
  lastModified: `${Date.now()}`,
};

function Home() {
  const [notes, setNotes] = useState<NoteList | []>([]);
  const [init, setInit] = useState(defaultcontent);
  const [currentNote, setCurrentNote] = useState(0);
  const addNote = () => {
    setNotes([defaultNote, ...notes]);
  };
  const onSave = (content: string, title: string) => {
    const newNote = {
      title: title,
      content: content,
      lastModified: `${Date.now()}`,
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(notes.length - 1);
  };
  const onDeleteNote = (title: string) => {
    setNotes(notes.filter((note) => note.title !== title));
  };
  const setActiveNote = (index: number) => {
    if (notes.length !== 0) {
      setInit(notes[index].content);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
    >
      <article className={Styles.Home}>
        <Sidebar
          notes={notes}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          addNote={addNote}
          setActiveNote={setActiveNote}
          deleteNote={onDeleteNote}
        />
        <section className={Styles.Workspace}>
          <Editor savehandler={onSave} init={init} />
        </section>
      </article>
    </motion.div>
  );
}

export default Home;
