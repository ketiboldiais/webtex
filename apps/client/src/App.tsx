import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_NOTE_CONTENT, WELCOME_NOTE_CONTENT } from "./Defaults";
import S from "@styles/App.module.css";
import {
  configureStore,
  createListenerMiddleware,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EquationNode, MathPlugin } from "./Equation";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
  INSERT_ORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import Autofocus from "../src/components/Editor/plugins/Autofocus";
import theme from "../src/components/Editor/EditorTheme";
import {
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  RootNode,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Dexie, { Table } from "dexie";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Cross,
  Italic,
  Justify,
  Underline,
} from "@components/Editor/Buttons/EditorButtons";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const WelcomeNote = makeNote(id(0), "Welcome", WELCOME_NOTE_CONTENT);
const BlankNote = makeNote(id(0), "", DEFAULT_NOTE_CONTENT);

class NoteDB extends Dexie {
  notes!: Table<Note>;
  constructor() {
    super("webtexDB");
    this.version(1).stores({
      notes: "id, title, content, date",
    });
  }
}

const db = new NoteDB();

async function db_getNotes() {
  try {
    const noteList = await db.notes.toArray();
    return noteList;
  } catch (error) {
    return [WelcomeNote];
  }
}

async function db_addNote(note: Note) {
  try {
    await db.notes.add(note);
  } catch (error) {
    console.error(`Couldn't add note:${error}`);
  }
}

async function db_deleteNote(note: Note) {
  try {
    await db.notes.where("id").equals(note.id).delete();
  } catch (error) {
    console.error(`Couldn't delete note:${error}`);
  }
}

async function db_saveNote(note: Note) {
  try {
    await db.notes.update(note.id, note);
  } catch (error) {
    console.error(`Couldn't update note:${error}`);
  }
}

function makeNote(id: string, title: string, content: string): Note {
  return { id, title, content, date: new Date().toDateString() };
}
function id(noteCount: number) {
  return `note${noteCount}`;
}

type NoteListObj = { [noteId: string]: Note };
interface NoteState {
  notelist: NoteListObj;
  activeNote: Note;
  noteCount: number;
}
let noteListArray: Note[] = [];
const initNoteList = await db_getNotes().then((notes) => {
  let init: NoteListObj = {};
  notes.forEach((note) => {
    noteListArray.push(note);
    init[note.id] = note;
  });
  init[WelcomeNote.id] = WelcomeNote;
  return init;
}).catch(() => ({ [WelcomeNote.id]: WelcomeNote }));

const initialState: NoteState = {
  notelist: initNoteList,
  activeNote: noteListArray.length !== 0 ? noteListArray[0] : WelcomeNote,
  noteCount: Object.values(initNoteList).length,
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<Note>) {
      const newNote = action.payload;
      state.notelist[newNote.id] = newNote;
      state.noteCount = Object.values(state.notelist).length;
      state.activeNote = state.notelist[newNote.id];
    },
    updateActiveNoteTitle(state, action: PayloadAction<string>) {
      state.activeNote.title = action.payload;
    },
    deleteNote(state, action: PayloadAction<Note>) {
      if (state.noteCount > 1) {
        state.noteCount -= 1;
        delete state.notelist[action.payload.id];
        const notelist = Object.values(state.notelist);
        state.activeNote = notelist[notelist.length - 1];
      } else {
        state.notelist[action.payload.id] = BlankNote;
        state.activeNote = BlankNote;
      }
    },
    setActiveNote(state, action: PayloadAction<Note>) {
      const activeNote = state.activeNote;
      state.notelist[activeNote.id] = state.activeNote;
      const note = action.payload;
      state.activeNote = note;
    },
    saveNote(state, action: PayloadAction<Note>) {
      const note = action.payload;
      state.notelist[note.id] = note;
      state.activeNote = note;
    },
  },
});

const {
  saveNote,
  addNote,
  setActiveNote,
  updateActiveNoteTitle,
  deleteNote,
} = noteSlice.actions;

const noteListenerMiddleware = createListenerMiddleware();
noteListenerMiddleware.startListening({
  actionCreator: addNote,
  effect: async (action, api) => {
    await db_addNote(action.payload);
  },
});
noteListenerMiddleware.startListening({
  actionCreator: deleteNote,
  effect: async (action, api) => {
    await db_deleteNote(action.payload);
  },
});
noteListenerMiddleware.startListening({
  actionCreator: saveNote,
  effect: async (action, api) => {
    await db_saveNote(action.payload);
  },
});
const noteListeners = noteListenerMiddleware.middleware;

const notesReducer = noteSlice.reducer;
const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(noteListeners),
});
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const useAppDispatch = () => useDispatch<AppDispatch>();

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const getNoteCount = () => useAppSelector((state) => state.notes.noteCount);

const getNotes = (): Note[] =>
  Object.values(useAppSelector((state) => state.notes.notelist));

const getActiveNote = (): Note =>
  useAppSelector((state) => state.notes.activeNote);

export function App() {
  return (
    <Provider store={store}>
      <div className={S.App}>
        <Navbar />
        <Workspace />
      </div>
    </Provider>
  );
}

function Workspace() {
  return (
    <div className={S.Workspace}>
      <SideBar />
      <TextEditor />
    </div>
  );
}

function SideBar() {
  const dispatch = useAppDispatch();
  const notes = getNotes();
  const noteCount = getNoteCount();
  

  return (
    <div className={S.Sidebar}>
      <div className={S.Header}>
        <button
          children={"New Note"}
          className={S.AddButton}
          onClick={() => {
            const title = `untitled${noteCount}`;
            const ID = id(noteCount + 1);
            const newNote = makeNote(ID, title, DEFAULT_NOTE_CONTENT);
            dispatch(addNote(newNote));
          }}
        />
      </div>
      <ul className={S.NoteList}>
        {notes.map((note) => <NoteItem key={note.id} note={note} />)}
      </ul>
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  const dispatch = useAppDispatch();
  const activeNote = getActiveNote();
  return (
    <li
      onClick={(event) => {
        event.stopPropagation();
        dispatch(setActiveNote(note));
      }}
    >
      <div className={styleNoteItem(note, activeNote)}>
        <div className={S.NoteItemHeader}>
          <strong>{titleNote(note, activeNote)}</strong>
          <button
            onClick={(event) => {
              event.stopPropagation();
              dispatch(deleteNote(note));
            }}
            children={"delete"}
            className={S.deleteBtn}
          />
        </div>
        <small>{note.date}</small>
      </div>
    </li>
  );
}

function titleNote(note1: Note, note2: Note) {
  return note1.id === note2.id ? note2.title : note1.title;
}
function styleNoteItem(note1: Note, note2: Note) {
  return note1.id === note2.id ? `${S.Item} ${S.Active}` : `${S.Item}`;
}

const editorConfig = {
  namespace: "editor",
  theme,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, EquationNode],
  onError(error: any) {
    throw error;
  },
};

function TextEditor() {
  const activeNote = getActiveNote();
  const [title, setTitle] = useState(activeNote.title);
  const [isEditing, setIsEditing] = useState(false);

  const doc = useRef<EditorState | null>(null);
  const dispatch = useAppDispatch();

  const save = () => {
    const content = getContent(doc.current);
    const note = makeNote(activeNote.id, title, content);
    dispatch(saveNote(note));
  };

  useEffect(() => {
    if (!isEditing) save();
  }, [isEditing]);

  useEffect(() => {
    dispatch(updateActiveNoteTitle(title));
  }, [title]);

  useEffect(() => {
    setTitle(activeNote.title);
  }, [activeNote]);

  return (
    <div className={S.TextEditor}>
      <div className={S.TextEditorHeader}>
        <input
          type="text"
          required
          value={title}
          placeholder={"Untitled"}
          className={S.NoteTitle}
          onChange={(event) => {
            setIsEditing(true);
            setTitle(event.target.value);
            setIsEditing(false);
          }}
        />
      </div>
      <div className={S.Lexical} onBlur={() => setIsEditing(false)}>
        <LexicalComposer initialConfig={{ ...editorConfig, editable: true }}>
          <EditorToolbar
            children={[
              <button
                key={"editor-save"}
                onClick={() => save()}
                className={S.SaveButton}
                children={"Save"}
              />,
            ]}
          />
          <HistoryPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className={S.EditorInput} />}
            placeholder={<div className={S.EditorPlaceholder}></div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <MathPlugin />
          <UpdatePlugin
            value={activeNote && activeNote.content
              ? activeNote.content
              : DEFAULT_NOTE_CONTENT}
          />
          <NodeEventPlugin
            nodeType={RootNode}
            eventType="click"
            eventListener={() => setIsEditing(true)}
          />
          <OnChangePlugin
            onChange={(editorState) => doc.current = editorState}
            ignoreSelectionChange
            ignoreHistoryMergeTagChange
          />
          <Autofocus />
        </LexicalComposer>
      </div>
    </div>
  );
}

type ToolbarOption = { label: string; value: string };
const opts: ToolbarOption[] = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
];

const blockMap = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};
type BlockType = keyof typeof blockMap;

function EditorToolbar({ children }: { children: JSX.Element[] }) {
  const [editor] = useLexicalComposerContext();

  return (
    <div className={S.EditorToolbar}>
      {children}
      <Bold
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      />
      <Cross
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
      />
      <Italic
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      />
      <Underline
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      />
      <AlignLeft
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
      />
      <AlignCenter
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
      />
      <AlignRight
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
      />
      <Justify
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
      />
    </div>
  );
}

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  chosenOption?: DropdownOption;
  onChange: (chosenOption?: DropdownOption) => void;
};

function Dropdown({ options, chosenOption, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectOption = (option: DropdownOption) => {
    if (option !== chosenOption) onChange(option);
  };
  const IsChosen = (option: DropdownOption) => {
    return option === chosenOption;
  };
  useEffect(() => {
    if (isOpen) setHighlightedIndex(0);
  }, [isOpen]);
  return (
    <div
      tabIndex={0}
      className={S.DropdownContainer}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <span className={S.ValueField}>{chosenOption?.label}</span>
      <div className={S.divider}></div>
      <div className={S.caret}></div>
      <dl className={`${S.optionsList} ${isOpen && S.show}`}>
        {options.map((option, i: number) => (
          <dt
            key={`${option.value}-${option.label}-${i}`}
            className={`${IsChosen(option) && S.selected} ${
              i === highlightedIndex && S.highlighted
            }`}
            onMouseEnter={() => setHighlightedIndex(i)}
            onClick={(event) => {
              event.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
          >
            <div className={S.Checkbox}>
              {IsChosen(option) && <div className={S.Checked}></div>}
            </div>
            {option.label}
          </dt>
        ))}
      </dl>
    </div>
  );
}

function getContent(editor: EditorState | null) {
  return editor === null ? DEFAULT_NOTE_CONTENT : JSON.stringify(editor);
}

interface updateProps {
  value: string;
}

function UpdatePlugin({ value }: updateProps) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (value) {
      const initialEditorState = editor.parseEditorState(value);
      editor.setEditorState(initialEditorState);
    }
  }, [value, editor]);
  return <></>;
}

function Navbar() {
  return (
    <nav className={S.NavBar}>
      <h1>Webtex</h1>
    </nav>
  );
}

type ClickEvt = React.MouseEvent<HTMLButtonElement>;
type ClickFn = React.MouseEventHandler<HTMLButtonElement>;

interface NoteItemProps {
  title: string;
  date: string;
  className: string;
}
