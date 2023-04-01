import { useModal } from "@hooks/useModal";
import { PlotPlugin, PlotPrompt } from "./Plot2d";
import app from "../ui/styles/App.module.scss";
import docstyle from "../ui/styles/Editor.module.scss";
import { Button } from "src/App";
import { ImagePlugin, InsertImageDialog } from "./Image.js";
import { InsertLatexDialog } from "./Latex.js";
import { Dropdown, DropdownItem } from "./Dropdown.js";
import { Plot3DPlugin } from "./Plot3d/plot3d.plugin.js";
import { Plot3DPrompt } from "./Plot3d/plot3d.prompt.js";
import { useEditor } from "@hooks/useEditor";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { InputFn, StrNull } from "src/App";
import {
  getActiveNote,
  makeNote,
  saveNote,
  useAppDispatch,
} from "src/state/state";
import { command, concat, EMPTY_NOTE } from "src/util";
import { ExcalidrawPlugin, INSERT_EXCALIDRAW_COMMAND } from "./Draw";
import { MarkdownPlugin } from "./Markdown";
// import {
  // InsertParametricPlotDialog,
  // ParametricPlotPlugin,
// } from "./PlotParametric/ParametricPlot";
import { ParametricPlotPlugin } from "./PlotParametric/parametric.plugin";
import { ParametricPlotPrompt } from "./PlotParametric/parametric.prompt";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { LatexPlugin } from "./Latex.js";
import { useAutosave } from "../hooks/useAutosave";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  RangeSelection,
  RootNode,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {
  $getSelectionStyleValueForProperty,
  $isAtNodeEnd,
  $patchStyleText,
  $wrapNodes,
} from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  BoldIcon,
  CenterIcon,
  DrawIcon,
  EquationIcon,
  ImageIcon,
  ItalicIcon,
  JustifyIcon,
  LeftIcon,
  ParametricIcon,
  Plot1Icon,
  Plot3DIcon,
  RightIcon,
  StrikeIcon,
  UnderlineIcon,
} from "./Icon.js";
import { SheetPrompt } from "./Sheet/sheet.prompt";
import { SheetPlugin } from "./Sheet/sheet.plugin";

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

function getContent(editor: EditorState | null) {
  return editor === null ? EMPTY_NOTE : JSON.stringify(editor);
}

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

export function Editor() {
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
    <div className={app.doc}>
      <ToolbarPlugin />
      <div className={app.page} onBlur={() => setIsEditing(false)}>
        <NoteTitle />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className={app.pageContent} />}
          placeholder={null}
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
        <LatexPlugin />
        <ImagePlugin />
        <PlotPlugin />
        <Plot3DPlugin />
        <ParametricPlotPlugin />
        <ExcalidrawPlugin />
        <MarkdownPlugin />
        <SheetPlugin />
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
    <div className={app.docTitle}>
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

function ToolbarPlugin() {
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

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  }, [activeEditor]);

  const insertLink = useCallback(() => {
    !isLink
      ? initEditor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://")
      : initEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
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
  const align = (type: "left" | "center" | "right" | "justify") => () =>
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type);
  const entext =
    (type: "bold" | "italic" | "underline" | "strikethrough") => () =>
      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  return (
    <ToolbarContext.Provider value={ctxObject}>
      <div className={concat(app.editor, app.toolbar)}>
        <Button
          label={<BoldIcon />}
          click={entext("bold")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<StrikeIcon />}
          click={entext("strikethrough")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<ItalicIcon />}
          click={entext("italic")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<UnderlineIcon />}
          click={entext("underline")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<LeftIcon />}
          click={align("left")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<CenterIcon />}
          click={align("center")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<RightIcon />}
          click={align("right")}
          className={docstyle.toolbarButton}
        />
        <Button
          label={<JustifyIcon />}
          click={align("justify")}
          className={docstyle.toolbarButton}
        />
        <BlockTypeDropdown />
        <FigureDropdown />
      </div>
    </ToolbarContext.Provider>
  );
}

function FigureDropdown() {
  const { activeEditor } = useEditor();
  const [modal, showModal] = useModal();
  return (
    <>
      <Dropdown title={<div className={app.figBox}>Figure</div>}>
        <DropdownItem
          label={"Plot2D"}
          icon={<Plot1Icon />}
          click={() =>
            showModal((onClose) => (
              <PlotPrompt
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ))}
        />
        <DropdownItem
          label={"Parametric Plot"}
          icon={<ParametricIcon />}
          click={() =>
            showModal((onClose) => (
              <ParametricPlotPrompt
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ))}
        />
        <DropdownItem
          label={"Plot3D"}
          icon={<Plot3DIcon />}
          click={() =>
            showModal((onClose) => (
              <Plot3DPrompt
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ))}
        />
        <DropdownItem
          label={"Image"}
          icon={<ImageIcon />}
          click={() =>
            showModal((onClose) => (
              <InsertImageDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ))}
        />
        <DropdownItem
          label={"Equation"}
          icon={<EquationIcon />}
          click={() =>
            showModal((onClose) => (
              <InsertLatexDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ))}
        />
        <DropdownItem
          label={"Sheet"}
          click={() =>
            showModal((onClose) => (
              <SheetPrompt activeEditor={activeEditor} onClose={onClose} />
            ))}
        />
        <DropdownItem
          label={"Draw"}
          icon={<DrawIcon />}
          click={() => {
            activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined);
          }}
        />
      </Dropdown>
      {modal}
    </>
  );
}

function BlockTypeDropdown() {
  const { initEditor } = useEditor();
  const { blockType } = useContext(ToolbarContext);

  function makeBlock(type: "paragraph" | "quote" | HeadingTagType) {
    return () =>
      (blockType !== type) && initEditor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        $wrapNodes(
          selection,
          (type === "paragraph" || type === "quote")
            ? () =>
              (type === "paragraph" ? $createParagraphNode : $createQuoteNode)()
            : () => $createHeadingNode(type),
        );
      });
  }

  function makeList(type: "bullet" | "number") {
    return () =>
      initEditor.dispatchCommand(
        blockType !== type
          ? type === "bullet"
            ? INSERT_UNORDERED_LIST_COMMAND
            : INSERT_ORDERED_LIST_COMMAND
          : REMOVE_LIST_COMMAND,
        undefined,
      );
  }

  return (
    <Dropdown
      title={
        <div className={app.text_format_box}>
          {blocktypeMap[blockType]}
        </div>
      }
    >
      <DropdownItem label={"Paragraph"} click={makeBlock("paragraph")} />
      <DropdownItem label={"Quote"} click={makeBlock("quote")} />
      <DropdownItem label={"Heading 1"} click={makeBlock("h1")} />
      <DropdownItem label={"Heading 2"} click={makeBlock("h2")} />
      <DropdownItem label={"Heading 3"} click={makeBlock("h3")} />
      <DropdownItem label={"Heading 4"} click={makeBlock("h4")} />
      <DropdownItem label={"Heading 5"} click={makeBlock("h5")} />
      <DropdownItem label={"Heading 6"} click={makeBlock("h6")} />
      <DropdownItem label={"Numbered List"} click={makeList("number")} />
      <DropdownItem label={"Bulleted List"} click={makeList("bullet")} />
    </Dropdown>
  );
}

interface IconProps {
  src: string;
}
export function Icon({ src }: IconProps) {
  return <i className={concat(app.icon, src)} />;
}
