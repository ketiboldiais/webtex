import {
  ChangeEventHandler,
  createContext,
  Dispatch,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_NOTE_CONTENT,
  EMPTY_NOTE,
  WELCOME_NOTE_CONTENT,
} from "./Defaults";
import S from "@styles/App.module.css";
import {
  configureStore,
  createListenerMiddleware,
  createSlice,
  nanoid,
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
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $wrapNodes } from "@lexical/selection";
import theme from "../src/components/Editor/EditorTheme";
import {
  $getSelection,
  $isRangeSelection,
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  RootNode,
} from "lexical";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Dexie, { Table } from "dexie";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const WelcomeNote = makeNote(`webtexDOCS`, "Welcome", WELCOME_NOTE_CONTENT);
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
  return {
    id,
    title,
    content,
    date: new Date().toLocaleDateString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
function id(noteCount: number) {
  return `note${noteCount}`;
}

type NoteListObj = { [noteId: string]: Note };
interface NoteState {
  notelist: NoteListObj;
  notes: Note[];
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
  notes: [...noteListArray, WelcomeNote],
  noteCount: Object.values(initNoteList).length,
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<Note>) {
      const newNote = action.payload;
      state.notes.unshift(action.payload);
      state.notelist[newNote.id] = newNote;
      state.noteCount = Object.values(state.notelist).length;
      state.activeNote = state.notelist[newNote.id];
    },
    deleteNote(state, action: PayloadAction<Note>) {
      if (state.noteCount > 1) {
        state.noteCount -= 1;
        delete state.notelist[action.payload.id];
        state.notes = state.notes.filter((n) => n.id !== action.payload.id);
        if (state.notes.length) {
          state.activeNote = state.notes[0];
        } else {
          state.activeNote = BlankNote;
        }
      } else {
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
      state.notes = state.notes.map((n) => n.id === note.id ? note : n);
      state.activeNote = note;
    },
  },
});

const {
  saveNote,
  addNote,
  setActiveNote,
  deleteNote,
} = noteSlice.actions;

const noteListenerMiddleware = createListenerMiddleware();
noteListenerMiddleware.startListening({
  actionCreator: addNote,
  effect: async (action) => {
    await db_addNote(action.payload);
  },
});
noteListenerMiddleware.startListening({
  actionCreator: deleteNote,
  effect: async (action) => {
    await db_deleteNote(action.payload);
  },
});
noteListenerMiddleware.startListening({
  actionCreator: saveNote,
  effect: async (action) => {
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

const getNotes = (): Note[] => useAppSelector((state) => state.notes.notes);

const getActiveNote = (): Note =>
  useAppSelector((state) => state.notes.activeNote);

export function App() {
  return (
    <Provider store={store}>
      <div className={S.App}>
        <Navbar />
        <main>
          <Workspace />
        </main>
      </div>
    </Provider>
  );
}

interface IEditorContext {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  activeNoteId: string;
  setActiveNoteId: Dispatch<SetStateAction<string>>;
  activeNoteTitle: string;
  setActiveEditor: Dispatch<SetStateAction<LexicalEditor>>;
  setActiveNoteTitle: Dispatch<SetStateAction<string>>;
}
function EditorContextProvider({ children }: { children: ReactNode }) {
  const activeNote = getActiveNote();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [activeNoteId, setActiveNoteId] = useState(activeNote.id);
  const [activeNoteTitle, setActiveNoteTitle] = useState(activeNote.title);

  const value: IEditorContext = {
    editor,
    activeEditor,
    setActiveEditor,
    activeNoteId,
    setActiveNoteId,
    activeNoteTitle,
    setActiveNoteTitle,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}
const EditorContext = createContext<IEditorContext>({} as IEditorContext);
const useEditor = () => useContext(EditorContext);

function Workspace() {
  const activeNote = getActiveNote();
  const defaultConfig = {
    namespace: "editor",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, EquationNode],
    onError(error: any) {
      throw error;
    },
    editorState: activeNote.content,
    editable: true,
  };
  return (
    <div className={S.Workspace}>
      <LexicalComposer initialConfig={defaultConfig}>
        <EditorContextProvider>
          <SideBar />
          <Editor />
        </EditorContextProvider>
      </LexicalComposer>
    </div>
  );
}

function SideBar() {
  const dispatch = useAppDispatch();
  let notes = getNotes();
  const { editor } = useEditor();
  const active = getActiveNote();
  function createNote(event: BtnEvt) {
    event.stopPropagation();
    const title = ``;
    const id = nanoid(10);
    const newnote = makeNote(id, title, EMPTY_NOTE);
    dispatch(addNote(newnote));
    const newstate = editor.parseEditorState(newnote.content);
    editor.setEditorState(newstate);
  }
  function destroyNote(event: BtnEvt, note: Note) {
    event.stopPropagation();
    dispatch(deleteNote(note));
    if (note.id === active.id) {
      let ns = notes.filter((n) => n.id !== note.id);
      if (ns.length) {
        const newnote = ns[0];
        const newstate = editor.parseEditorState(newnote.content);
        editor.setEditorState(newstate);
      } else {
        const blank = editor.parseEditorState(EMPTY_NOTE);
        editor.setEditorState(blank);
      }
    }
  }
  return (
    <div className={S.Sidebar}>
      <div className={S.Header}>
        <Button label={"New Note"} click={createNote} />
      </div>
      <ul className={S.NoteList}>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onDelete={destroyNote} />
        ))}
      </ul>
    </div>
  );
}
interface INoteItem {
  note: Note;
  onDelete: (event: BtnEvt, note: Note) => void;
}
function NoteItem({ note, onDelete }: INoteItem) {
  const dispatch = useAppDispatch();
  const activeNote = getActiveNote();
  const { activeNoteTitle } = useEditor();
  const { editor } = useEditor();
  function switchNote(event: LiEvt) {
    event.stopPropagation();
    dispatch(setActiveNote(note));
    const newstate = editor.parseEditorState(note.content);
    editor.setEditorState(newstate);
  }
  const noteTitle = note.id === activeNote.id ? activeNoteTitle : note.title;
  return (
    <li onClick={switchNote} className={styleNoteItem(note, activeNote)}>
      <div className={S.NoteItemHeader}>
        <Boldtext content={noteTitle} />
        {note.id !== `webtexDOCS` && (
          <Button
            label={"delete"}
            click={(e) => onDelete(e, note)}
          />
        )}
      </div>
      <Subtext content={note.date} />
    </li>
  );
}

function Boldtext({ content }: { content: string }) {
  return <strong>{content}</strong>;
}

function Subtext({ content }: { content: string }) {
  return <small>{content}</small>;
}

function styleNoteItem(note1: Note, note2: Note) {
  return note1.id === note2.id ? `${S.Item} ${S.Active}` : `${S.Item}`;
}

function Editor() {
  const dispatch = useAppDispatch();
  const doc = useRef<EditorState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { activeNoteId, activeNoteTitle } = useEditor();

  const save = () => {
    const content = getContent(doc.current);
    const note = makeNote(activeNoteId, activeNoteTitle, content);
    dispatch(saveNote(note));
  };

  useEffect(() => {
    if (!isEditing && !isFirstRender) {
      save();
    }
  }, [isEditing]);

  return (
    <div className={S.TextEditor}>
      <EditorToolbar />
      <div className={S.Lexical} onBlur={() => setIsEditing(false)}>
        <DocTitle />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className={S.EditorInput} />}
          placeholder={
            <div className={S.EditorPlaceholder}>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <NodeEventPlugin
          nodeType={RootNode}
          eventType={"click"}
          eventListener={() => {
            setIsEditing(true);
            setIsFirstRender(false);
          }}
        />
        <OnChangePlugin onChange={(editorState) => doc.current = editorState} />
        <ListPlugin />
        <MathPlugin />
      </div>
    </div>
  );
}

type InputFn = ChangeEventHandler<HTMLInputElement>;

function DocTitle() {
  const activeNote = getActiveNote();
  const [title, setTitle] = useState(activeNote.title);
  const { setActiveNoteTitle, setActiveNoteId } = useEditor();

  const updateTitle: InputFn = (event) => {
    setTitle(event.target.value);
  };

  useEffect(() => {
    setActiveNoteTitle(title);
  }, [title]);

  useEffect(() => {
    setTitle(activeNote.title);
    setActiveNoteId(activeNote.id);
  }, [activeNote]);

  return (
    <div className={S.NoteTitle}>
      <input
        type={"text"}
        value={title}
        placeholder={"Untitled"}
        onChange={updateTitle}
      />
    </div>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const trigger = {
    bold: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    strikethrough: () =>
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    italicize: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    underline: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    align: {
      left: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
      center: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
      right: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
      justify: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    },
    list: {
      ordered: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      unordered: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    },
    h1: () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode("h1"));
        }
      });
    },
  };
  return (
    <div className={S.EditorToolbar}>
      <Button label={<BoldIcon />} click={trigger.bold} />
      <Button label={<StrikeIcon />} click={trigger.strikethrough} />
      <Button label={<ItalicIcon />} click={trigger.italicize} />
      <Button label={<UnderlineIcon />} click={trigger.underline} />
      <Button label={<AlignLeftIcon />} click={trigger.align.left} />
      <Button label={<AlignCenterIcon />} click={trigger.align.center} />
      <Button label={<AlignRightIcon />} click={trigger.align.right} />
      <Button label={<JustifyIcon />} click={trigger.align.justify} />
      <Button label={<OLIcon />} click={trigger.list.ordered} />
      <Button label={<ULIcon />} click={trigger.list.unordered} />
      <Dropdown title={"Format"}>
        <Button label={"Heading 1"} click={trigger.h1} />
        <Button label={"Heading 2"} click={trigger.h1} />
        <Button label={"Heading 3"} click={trigger.h1} />
        <Button label={"Heading 4"} click={trigger.h1} />
        <Button label={"Heading 5"} click={trigger.h1} />
      </Dropdown>
    </div>
  );
}

function Dropdown(
  { title, children }: { title?: string; children: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const toggle: DivFn = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };
  return (
    <div onClick={toggle} className={S.dropdown}>
      <div className={S.placeholder}>{title}</div>
      <div className={open ? `${S.optionsList} ${S.active}` : S.optionsList}>
        {children}
      </div>
    </div>
  );
}

function getContent(editor: EditorState | null) {
  return editor === null ? DEFAULT_NOTE_CONTENT : JSON.stringify(editor);
}

function Navbar() {
  return (
    <nav className={S.NavBar}>
      <h1>Webtex</h1>
    </nav>
  );
}

type BtnFn = MouseEventHandler<HTMLButtonElement>;
type BtnEvt = Parameters<BtnFn>[0];
interface ButtonProps {
  click: BtnFn;
  label?: string | ReactNode;
  className?: string;
}
import boldSVG from "./icons/bold.svg";
function BoldIcon() {
  return <img src={boldSVG} />;
}
import centerSVG from "./icons/alignCenter.svg";
function AlignCenterIcon() {
  return <img src={centerSVG} />;
}
import italicSVG from "./icons/italic.svg";
function ItalicIcon() {
  return <img src={italicSVG} />;
}
import strikeSVG from "./icons/strike.svg";
function StrikeIcon() {
  return <img src={strikeSVG} />;
}
import underlineSVG from "./icons/underline.svg";
function UnderlineIcon() {
  return <img src={underlineSVG} />;
}
import alignLeftSVG from "./icons/alignLeft.svg";
function AlignLeftIcon() {
  return <img src={alignLeftSVG} />;
}
import alignRightSVG from "./icons/alignRight.svg";
function AlignRightIcon() {
  return <img src={alignRightSVG} />;
}
import justifySVG from "./icons/justify.svg";
function JustifyIcon() {
  return <img src={justifySVG} />;
}
import ulSVG from "./icons/bulletedList.svg";
function ULIcon() {
  return <img src={ulSVG} />;
}
import olSVG from "./icons/numberedList.svg";
function OLIcon() {
  return <img src={olSVG} />;
}

function Button({ click, label, className }: ButtonProps) {
  return <button onClick={click} className={className}>{label}</button>;
}

type LiFn = MouseEventHandler<HTMLLIElement>;
type DivFn = MouseEventHandler<HTMLDivElement>;
type LiEvt = Parameters<LiFn>[0];
