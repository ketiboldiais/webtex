/**
 * @file App.tsx
 * Some preliminary comments:
 * There's a fair amount of complexity with this application,
 * but taking a functional approach makes things much easier.
 * First, there are a lot of states to manage:
 *
 * 1. The global, Redux state.
 * 2. The editor state.
 * 3. The toolbar state.
 * 4. The note list state.
 * 5. The change-history state.
 *
 * These states MUST ALL be kept in sync. The real challenge
 * is syncing the global Redux state with the Lexical editor
 * state. Lexical uses its own shadow DOM, and it uses flushSync
 * for certain updates. Accordingly, we can't use useEffect or
 * simple auto-save to save the user's current work. Doing so
 * can cause flushSync to trigger while React is already rendering.
 * Because of this friction, we must make even smaller substates
 * with React's useContext hook.
 */

/* -------------------------------------------------------------------------- */
/*                               NOTE UTILITIES                               */
/* -------------------------------------------------------------------------- */

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

/**
 * These are default notes. They're stringified ASTs
 * of the Lexical editor.
 *
 * WELCOME_NOTE_CONTENT
 * - The documentation note.
 *
 * EMPTY_NOTE
 * - The note used as a placeholder in the event
 *   the active note in Redux is undefined, as well
 *   as the note used when creating a new note.
 */
import { command, concat, toggle, WELCOME_NOTE_CONTENT } from "./util/index.js";
import { EMPTY_NOTE } from "./util/index.js";

const WelcomeNote = makeNote(`webtexDOCS`, "Welcome", WELCOME_NOTE_CONTENT);
const BlankNote = makeNote(id(0), "", EMPTY_NOTE);

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

/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */
/**
 * Webtex uses IndexedDB to store notes. The IndexedDB API is fairly hairy
 * to work with, and it's best to just use an existing, well-tested library.
 * In this case, we use Dexie.
 */
import Dexie, { Table } from "dexie";

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

/* -------------------------------------------------------------------------- */
/*                              REDUX NOTE SLICE                              */
/* -------------------------------------------------------------------------- */
/**
 * We use Redux to manage the global state.
 */
import { nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

/* ------------------------ Initial Note Slice State ------------------------ */

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

/* -------------------------- Slice Initialization -------------------------- */

import { createSlice } from "@reduxjs/toolkit";

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

/* --------------------------- Listener Middleware -------------------------- */
/**
 * To save to the Dexie database, we use listener middleware.
 * We do so to keep the notes slice reducers as pure as possible.
 * Saving to Dexie is a side-effect, unnecessary for the the note
 * slice reducer to function.
 */
import { createListenerMiddleware } from "@reduxjs/toolkit";

const noteListenerMiddleware = createListenerMiddleware();

/**
 * Saves a note to the database the moment a note is added.
 * Todo: Only add notes that actually have content. At the moment,
 * this listener will add notes blindly.
 */
noteListenerMiddleware.startListening({
  actionCreator: addNote,
  effect: async (action) => {
    await db_addNote(action.payload);
  },
});

/**
 * Deletes a note from the database
 * the moment a note is deleted.
 */
noteListenerMiddleware.startListening({
  actionCreator: deleteNote,
  effect: async (action) => {
    await db_deleteNote(action.payload);
  },
});

/**
 * Saves a note to the database
 * the moment a note is saved.
 * Todo: Limit this action as well.
 */
noteListenerMiddleware.startListening({
  actionCreator: saveNote,
  effect: async (action) => {
    await db_saveNote(action.payload);
  },
});

/**
 * Pointer to all the listeners.
 * We concatenate the pointee to
 * the Redux Store's middlware field.
 */
const noteListeners = noteListenerMiddleware.middleware;

/* -------------------------------------------------------------------------- */
/*                         Redux Store (Global State)                         */
/* -------------------------------------------------------------------------- */

import { configureStore } from "@reduxjs/toolkit";

const notesReducer = noteSlice.reducer;

const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(noteListeners),
});

/* -------------------------------- Selectors ------------------------------- */

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
const getNotes = (): Note[] => useAppSelector((state) => state.notes.notes);
const getActiveNote = (): Note =>
  useAppSelector((state) => state.notes.activeNote);

/* -------------------------------------------------------------------------- */
/*                                  REACT APP                                 */
/* -------------------------------------------------------------------------- */

/** React dependencies. */
import {
  ChangeEventHandler,
  createContext,
  Dispatch,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/** Application Styles. */
import S from "./ui/styles/App.module.scss";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className={S.App}>
          <Navbar />
          <Page />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

/* --------------------------------- NAVBAR --------------------------------- */

function Navbar() {
  return (
    <nav className={S.NavBar}>
      <h1>Webtex</h1>
      <ul className={S.LinkList}>
        <li>
          <Link to="/">Workspace</Link>
        </li>
        {/* <li><Link to="/canvas">Canvas</Link></li> */}
      </ul>
    </nav>
  );
}

/* ----------------------------- Page Component ----------------------------- */

function Page() {
  return (
    <main>
      <Routes>
        <Route path={"/"} element={<Workspace />} />
        {/* <Route path={"/canvas"} element={<Canvas />} /> */}
      </Routes>
    </main>
  );
}

function Canvas() {
  return (
    <div className={S.Playground}>
      {/* <ModalBox title={"Plot3D"} ref={null}> */}
      {/* <Plot3D_Dialog /> */}
      {/* </ModalBox> */}
    </div>
  );
}

/* ------------------------ SUBSTATE: EDITOR CONTEXT ------------------------ */

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import editor from "./ui/styles/Editor.module.scss";
const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: editor.placeholder,
  paragraph: editor.paragraph,
  quote: editor.quote,
  heading: {
    h1: editor.heading1,
    h2: editor.heading2,
    h3: editor.heading3,
    h4: editor.heading4,
    h5: editor.heading5,
    h6: editor.heading6,
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: editor.ol,
    ul: editor.ul,
    listitem: editor.li,
  },
  image: editor.image,
  link: editor.link,
  text: {
    bold: editor.bold,
    italic: editor.italic,
    overflowed: "editor-text-overflowed",
    hashtag: "editor-text-hashtag",
    underline: editor.underline,
    strikethrough: editor.strike,
    underlineStrikethrough: editor.ustrike,
    code: "editor-text-code",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

interface IEditorContext {
  initEditor: LexicalEditor;
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
    initEditor: editor,
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
export const EditorContext = createContext<IEditorContext>(
  {} as IEditorContext,
);
export const useEditor = () => useContext(EditorContext);

/* -------------------------------------------------------------------------- */
/*                               PAGE: WORKSPACE                              */
/* -------------------------------------------------------------------------- */

function Workspace() {
  const activeNote = getActiveNote();
  const defaultConfig = {
    namespace: "editor",
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      EquationNode,
      ImageNode,
      PlotNode,
      Plot3DNode,
    ],
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

/* --------------------------------- SIDEBAR -------------------------------- */

function SideBar() {
  const dispatch = useAppDispatch();
  let notes = getNotes();
  const { activeEditor } = useEditor();
  const active = getActiveNote();

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
    <div className={S.Sidebar}>
      <div className={S.Header}>
        <Button label={"new"} click={createNote} />
      </div>
      <ul className={S.NoteList}>
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
import noteStyles from "./ui/styles/Notes.module.scss";

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
      className={toggle(
        concat(noteStyles.item, noteStyles.active),
        noteStyles.item,
      ).on(note.id === activeNote.id)}
    >
      <div className={noteStyles.noteHeader}>
        <Boldtext content={noteTitle} />
        {note.id !== `webtexDOCS` && (
          <button
            className={noteStyles.delete}
            onClick={(e) => onDelete(e, note)}
          >
            &times;
          </button>
        )}
      </div>
      <Subtext content={note.date} />
    </li>
  );
}

/* --------------------------------- EDITOR --------------------------------- */
/**
 * This is the actual text-editor component. It's a function that takes
 * no arguments.
 *
 * To minimize global dispatches, we don't save
 * on first render (because the displayed note
 * is already saved) and we don't save while
 * the user is typing (a user typing at
 * 90 WPM roughly translates to 7 dispatches every
 * second -- that's far too much). We accomplish this with
 * the useEffect hook below.
 *
 * If the user is editing, however, we will use autoSave
 * during brief pauses:
 */

import { useAutosave } from "./hooks/useAutosave";

/** Type definitions provded by Lexical. */
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  EditorState,
  LexicalEditor,
  RootNode,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

/** Error boundary handler for debugging, provided by Lexical. */
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

/** Commands provided by Lexical. */
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND } from "lexical";

/** Selection helper functions provided by Lexical. */
import { $getSelection, $isRangeSelection, RangeSelection } from "lexical";
import {
  $getSelectionStyleValueForProperty,
  $isAtNodeEnd,
  $patchStyleText,
  $wrapNodes,
} from "@lexical/selection";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";

/** Returns the selected node. */
function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) return anchorNode;
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

/** The Editor uses various plugins provided by Lexical. */
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

/** RichTextPlugin & Dependencies */
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
  HeadingTagType,
  QuoteNode,
} from "@lexical/rich-text";

/** List Plugin & Dependecies */
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

/** Link Plugin & Dependecies */
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

/**
 * Custom plugin: Math Plugin
 * Enables inline-markdown KaTeX rendering.
 */
import { EquationNode, EquationsPlugin, MathPlugin } from "./chips/Equation";

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
    if (!isEditing && !isFirstRender) save();
  }, [isEditing]);

  useAutosave({
    data: { activeNoteTitle, content: getContent(doc.current) },
    onSave: () => {
      if (!isEditing && !isFirstRender) save();
    },
  });

  return (
    <div className={editor.page}>
      <Toolbar />
      <div className={editor.body} onBlur={() => setIsEditing(false)}>
        <NoteTitle />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className={editor.input} />}
          placeholder={<div className={editor.placeholder}></div>}
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
        <EquationsPlugin />
        <ImagePlugin />
        <PlotPlugin />
        <Plot3DPlugin />
      </div>
    </div>
  );
}

/* ------------------------------- NOTE TITLE ------------------------------- */
/**
 * The note title is what links the editor to what's shown in the notelist
 * panel. We separate it from the editor because again, it isn't necessary
 * for the editor's functionality. When the input changes, the active note's
 * title in the notelist changes accordingly. Again, this is a nice feature,
 * but not necessary.
 */
function NoteTitle() {
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
    <div className={editor.title}>
      <input
        type={"text"}
        value={title}
        placeholder={"Untitled"}
        onChange={updateTitle}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Editor Toolbar                               */
/* -------------------------------------------------------------------------- */
/**
 * We need a separate, toolbar state to sync changes in the editor with
 * what's shown on the toolbar. This state is separated because (1) the editor
 * doesn't necessarily need it to the function (it's just a nice-to-have),
 * and (2) it has nothing to do with the global state.
 */
/* ------------------------ Substate: Toolbar Context ----------------------- */
interface ToolbarCtx {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCrossed: boolean;
  isLink: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isCode: boolean;
  insertLink: () => void;
  fontFamily: string;
  fontSize: string;
  fontColor: string;
  blockType: Blocktype;
  selectedElementKey: string | null;
  applyStyleText: (styles: Record<string, string>) => void;
}
/**
 * We don't initialize this yet because it's returned by the
 * Toolbar plugin.
 */
const ToolbarContext = createContext<ToolbarCtx>({} as ToolbarCtx);

/**
 * We define a Blocktype as a sum type, whose members are
 * the keys of blocktypeMap. The keys biject to what's
 * displayed in the toolbar.
 */
type Blocktype = keyof typeof blocktypeMap;
const blocktypeMap = {
  number: "Numbered List",
  bullet: "Bulleted List",
  check: "Check List",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  paragraph: "Normal",
  quote: "Quote",
};

import { ModalBox, useModal } from "@hooks/useModal";
import { InsertEquationDialog } from "./chips/Equation";
import { InsertPlotDialog, PlotPlugin } from "./chips/FPlot.js";
import icon from "./ui/styles/icons.module.scss";
type StrNull = string | null;
function Toolbar() {
  const { initEditor, activeEditor, setActiveEditor } = useEditor();
  const [blockType, setBlocktype] = useState<Blocktype>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<StrNull>(null);
  const [fontSize, setFontSize] = useState<string>("12px");
  const [fontColor, setFontColor] = useState<string>("black");
  const [fontFamily, setFontFamily] = useState<string>("CMU Serif");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCrossed, setIsCrossed] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isEditable, setIsEditable] = useState(() => initEditor.isEditable());

  /**
   * When the user makes a selection, we want to
   * indicate that selection's current type
   * in the toolbar.
   */
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getKey() === "root"
        ? anchorNode
        : $findMatchingParent(anchorNode, (e) => {
          const parent = e.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      /** Handle text selection type */
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsCrossed(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      /** Handle link selection type */
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      /** Handle list selection type */
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlocktype(type as Blocktype);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlocktype(type as Blocktype);
          return;
        }
      }

      /** Handle buttons */
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "12px"),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", "black"),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(
          selection,
          "font-family",
          "inherit",
        ),
      );
    }
  }, [activeEditor]);

  /**
   * Ensure the selection stays highlighted
   * when the user tries to change the format.
   */
  useEffect(() => {
    const handleSelectionChange = command.priority.critical(
      SELECTION_CHANGE_COMMAND,
      (_, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
    );
    return initEditor.registerCommand(...handleSelectionChange);
  }, [initEditor, updateToolbar]);

  useEffect(() => {
    const handleUndo = command.priority.critical(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
    );
    const handleRedo = command.priority.critical(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
    );

    return mergeRegister(
      activeEditor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      activeEditor.registerCommand(...handleUndo),
      activeEditor.registerCommand(...handleRedo),
    );
  }, [activeEditor, initEditor, updateToolbar]);

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  }, [activeEditor]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      initEditor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      initEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [initEditor, isLink]);

  const ctxObject: ToolbarCtx = {
    fontFamily,
    fontSize,
    fontColor,
    isBold,
    isItalic,
    isUnderline,
    isCode,
    isLink,
    applyStyleText,
    insertLink,
    isCrossed,
    isSubscript,
    isSuperscript,
    selectedElementKey,
    blockType,
  };

  const strike = () =>
    activeEditor.dispatchCommand(
      FORMAT_TEXT_COMMAND,
      "strikethrough",
    );
  const enbold = () =>
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  const italicize = () =>
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  const uline = () =>
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  const aLeft = () =>
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  const aCenter = () =>
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  const aRight = () =>
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  const justify = () =>
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  return (
    <ToolbarContext.Provider value={ctxObject}>
      <div className={editor.toolbar}>
        <Button label={<Icon src={icon.bold} />} click={enbold} />
        <Button label={<Icon src={icon.strike} />} click={strike} />
        <Button label={<Icon src={icon.italic} />} click={italicize} />
        <Button label={<Icon src={icon.underline} />} click={uline} />
        <Button label={<Icon src={icon.alignLeft} />} click={aLeft} />
        <Button label={<Icon src={icon.alignCenter} />} click={aCenter} />
        <Button label={<Icon src={icon.alignRight} />} click={aRight} />
        <Button label={<Icon src={icon.alignJustify} />} click={justify} />
        <BlockTypeDropdown />
        <FigureDropdown />
      </div>
    </ToolbarContext.Provider>
  );
}

import { ImageNode, ImagePlugin, InsertImageDialog } from "./chips/Image.js";
import { PlotNode } from "./chips/FPlot.js";
import { Dropdown } from "./chips/Dropdown.js";
import {
  InsertPlot3DDialog,
  Plot3DNode,
  Plot3DPlugin,
} from "./chips/Plot3D.js";

function FigureDropdown() {
  const { activeEditor } = useEditor();
  const [modal, showModal] = useModal();

  const promptPlot = () =>
    showModal(
      "Plot 2D",
      (onClose) => (
        <InsertPlotDialog
          activeEditor={activeEditor}
          onClose={onClose}
        />
      ),
    );

  const promptPlot3d = () =>
    showModal(
      "Plot 3D",
      (onClose) => (
        <InsertPlot3DDialog activeEditor={activeEditor} onClose={onClose} />
      ),
    );

  const promptImage = () =>
    showModal("Insert Image", (onClose) => (
      <InsertImageDialog
        activeEditor={activeEditor}
        onClose={onClose}
      />
    ));

  const promptEquation = () =>
    showModal(
      "Insert Block Math",
      (onClose) => (
        <InsertEquationDialog
          activeEditor={activeEditor}
          onClose={onClose}
        />
      ),
    );

  return (
    <>
      <Dropdown
        title={<Icon src={icon.plus} />}
        options={[
          {
            label: "Plot2D",
            click: promptPlot,
            id: "fPlot2d",
            icon: icon.plot1,
          },
          {
            label: "Plot3D",
            click: promptPlot3d,
            id: "fPlot3d",
            icon: icon.plot3D,
          },
          {
            label: "Image",
            click: promptImage,
            id: "fImage",
            icon: icon.image,
          },
          {
            label: "Equation",
            click: promptEquation,
            id: "fEquation",
            icon: icon.equation,
          },
        ]}
      />
      {modal}
    </>
  );
}

function BlockTypeDropdown() {
  const { initEditor } = useEditor();
  const { blockType } = useContext(ToolbarContext);

  function formatParagraph() {
    if (blockType === "paragraph") return;
    initEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $wrapNodes(selection, () => $createParagraphNode());
    });
  }

  function H(heading: HeadingTagType) {
    if (blockType === heading) return;
    initEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $wrapNodes(selection, () => $createHeadingNode(heading));
    });
  }

  function formatQuote() {
    if (blockType === "quote") return;
    initEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $wrapNodes(selection, () => $createQuoteNode());
    });
  }

  function formatBulletList() {
    const command = blockType !== "bullet"
      ? INSERT_UNORDERED_LIST_COMMAND
      : REMOVE_LIST_COMMAND;
    initEditor.dispatchCommand(command, undefined);
  }
  function formatNumberedList() {
    const command = blockType !== "number"
      ? INSERT_ORDERED_LIST_COMMAND
      : REMOVE_LIST_COMMAND;
    initEditor.dispatchCommand(command, undefined);
  }

  return (
    <Dropdown
      fixedWidth={true}
      title={blocktypeMap[blockType]}
      options={[
        { label: "Paragraph", click: formatParagraph, id: "fptag" },
        { label: "Quote", click: formatQuote, id: "fquot" },
        { label: "Heading 1", click: () => H("h1"), id: "h1" },
        { label: "Heading 2", click: () => H("h2"), id: "h2" },
        { label: "Heading 3", click: () => H("h3"), id: "h3" },
        { label: "Heading 4", click: () => H("h4"), id: "h4" },
        { label: "Heading 5", click: () => H("h5"), id: "h5" },
        { label: "Heading 6", click: () => H("h6"), id: "h6" },
        { label: "Numbered List", click: formatNumberedList, id: "fnl" },
        { label: "Bulleted List", click: formatBulletList, id: "fbl" },
      ]}
    />
  );
}

interface IconProps {
  src: string;
}
export function Icon({ src }: IconProps) {
  return <i className={src} />;
}

function getContent(editor: EditorState | null) {
  return editor === null ? EMPTY_NOTE : JSON.stringify(editor);
}

function Boldtext({ content }: { content: string }) {
  return <strong>{content}</strong>;
}

function Subtext({ content }: { content: string }) {
  return <small>{content}</small>;
}

export interface ButtonProps {
  click: BtnFn;
  label?: string | ReactNode;
  className?: string;
}
export function Button({ click, label, className }: ButtonProps) {
  return (
    <button onClick={click} className={className}>
      {label}
    </button>
  );
}

export type LiFn = MouseEventHandler<HTMLLIElement>;
export type DivFn = MouseEventHandler<HTMLDivElement>;
export type LiEvt = Parameters<LiFn>[0];
export type InputFn = ChangeEventHandler<HTMLInputElement>;
export type BtnFn = MouseEventHandler<HTMLButtonElement>;
export type BtnEvt = Parameters<BtnFn>[0];
