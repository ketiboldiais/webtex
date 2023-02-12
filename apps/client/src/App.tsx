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
import { EMPTY_NOTE, WELCOME_NOTE_CONTENT } from "./Defaults";

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
import S from "@styles/App.module.css";
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
        {/* <li><Link to="/packages">Packages</Link></li> */}
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
        {/* <Route path={"/packages"} element={<Packages />} /> */}
      </Routes>
    </main>
  );
}

/* ------------------------------ PACKAGES PAGE ----------------------------- */

function Packages() {
  return (
    <div>
      <p>
        This is the packages page for Webtex, which outlines some of the modules
        used by the editor.
      </p>
    </div>
  );
}

/* ------------------------ SUBSTATE: EDITOR CONTEXT ------------------------ */

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import theme from "../src/components/Editor/EditorTheme";

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
const EditorContext = createContext<IEditorContext>({} as IEditorContext);
const useEditor = () => useContext(EditorContext);

/* -------------------------------------------------------------------------- */
/*                               PAGE: WORKSPACE                              */
/* -------------------------------------------------------------------------- */

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
    <li onClick={switchNote} className={styleNoteItem(note, activeNote)}>
      <div className={S.NoteItemHeader}>
        <Boldtext content={noteTitle} />
        {note.id !== `webtexDOCS` && (
          <Button
            label={"delete"}
            click={(e) => onDelete(e, note)}
            className={S.DeleteButton}
          />
        )}
      </div>
      <Subtext content={note.date} />
    </li>
  );
}

function styleNoteItem(note1: Note, note2: Note) {
  return note1.id === note2.id ? `${S.Item} ${S.Active}` : `${S.Item}`;
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

import { useAutosave } from "@hooks/useAutosave";

/** Type definitions provded by Lexical. */
import {
  $createParagraphNode,
  COMMAND_PRIORITY_CRITICAL,
  EditorState,
  ElementNode,
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
import { $getNearestNodeOfType } from "@lexical/utils";

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
import { EquationNode, MathPlugin } from "./Equation";

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
    <div className={S.TextEditor}>
      <Toolbar />
      <div className={S.Lexical} onBlur={() => setIsEditing(false)}>
        <NoteTitle />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className={S.EditorInput} />}
          placeholder={<div className={S.EditorPlaceholder}></div>}
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

function Toolbar() {
  const { initEditor, activeEditor, setActiveEditor } = useEditor();
  const [blockType, setBlocktype] = useState<Blocktype>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null,
  );
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

  /**
   * When the user makes a selection, we want to
   * indicate that selection's current type
   * in the toolbar.
   */
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor.getNode();
      const element = anchor.getKey() === "root"
        ? anchor
        : anchor.getTopLevelElementOrThrow();
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
          const parentList = $getNearestNodeOfType<ListNode>(anchor, ListNode);
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
          "CMU Serif",
        ),
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return initEditor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [initEditor, updateToolbar]);

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
  const trigger = {
    bold: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    strikethrough: () =>
      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    italicize: () =>
      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    underline: () =>
      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    align: {
      left: () => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
      center: () =>
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
      right: () =>
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
      justify: () =>
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    },
  };
  return (
    <ToolbarContext.Provider value={ctxObject}>
      <div className={S.EditorToolbar}>
        <Button label={<BoldIcon />} click={trigger.bold} />
        <Button label={<StrikeIcon />} click={trigger.strikethrough} />
        <Button label={<ItalicIcon />} click={trigger.italicize} />
        <Button label={<UnderlineIcon />} click={trigger.underline} />
        <Button label={<AlignLeftIcon />} click={trigger.align.left} />
        <Button label={<AlignCenterIcon />} click={trigger.align.center} />
        <Button label={<AlignRightIcon />} click={trigger.align.right} />
        <Button label={<JustifyIcon />} click={trigger.align.justify} />
        <BlockTypeDropdown />
      </div>
    </ToolbarContext.Provider>
  );
}

function BlockTypeDropdown() {
  const { initEditor } = useEditor();
  const { blockType } = useContext(ToolbarContext);

  function formatParagraph() {
    if (blockType !== "paragraph") {
      initEditor.update(selectionUpdate(() => $createParagraphNode()));
    }
  }

  function formatHeading(heading: HeadingTagType) {
    if (blockType !== heading) {
      initEditor.update(selectionUpdate(() => $createHeadingNode(heading)));
    }
  }

  function formatQuote() {
    if (blockType !== "quote") {
      initEditor.update(selectionUpdate(() => $createQuoteNode()));
    }
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
    <Dropdown title={blocktypeMap[blockType]}>
      <Button label={"Paragraph"} click={formatParagraph} />
      <Button label={"Quote"} click={formatQuote} />
      <Button label={"Heading 1"} click={() => formatHeading("h1")} />
      <Button label={"Heading 2"} click={() => formatHeading("h2")} />
      <Button label={"Heading 3"} click={() => formatHeading("h3")} />
      <Button label={"Heading 4"} click={() => formatHeading("h4")} />
      <Button label={"Heading 5"} click={() => formatHeading("h5")} />
      <Button label={"Numbered List"} click={formatNumberedList} />
      <Button label={"Bulleted List"} click={formatBulletList} />
    </Dropdown>
  );
}

function Dropdown({ title, children, className }: typeDropdown) {
  const classname = className ? `${className} ${S.dropdown}` : S.dropdown;
  const [open, setOpen] = useState(false);
  const toggle: DivFn = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };
  return (
    <div onClick={toggle} className={classname}>
      <div className={S.placeholder}>{title}</div>
      <div className={open ? `${S.optionsList} ${S.active}` : S.optionsList}>
        {children}
      </div>
    </div>
  );
}

function getContent(editor: EditorState | null) {
  return editor === null ? EMPTY_NOTE : JSON.stringify(editor);
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

function Boldtext({ content }: { content: string }) {
  return <strong>{content}</strong>;
}

function Subtext({ content }: { content: string }) {
  return <small>{content}</small>;
}
function Button({ click, label, className }: ButtonProps) {
  return <button onClick={click} className={className}>{label}</button>;
}

function selectionUpdate(callback: () => ElementNode) {
  return () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $wrapNodes(selection, callback);
    }
  };
}
type LiFn = MouseEventHandler<HTMLLIElement>;
type DivFn = MouseEventHandler<HTMLDivElement>;
type LiEvt = Parameters<LiFn>[0];
type InputFn = ChangeEventHandler<HTMLInputElement>;

interface typeDropdown {
  title?: string;
  children: ReactNode;
  className?: string;
}
