/* -------------------------------------------------------------------------- */
/*                               Editor Toolbar                               */
/* -------------------------------------------------------------------------- */
/**
 * We need a separate, toolbar state to sync changes in the editor with
 * what's shown on the toolbar. This state is separated because (1) the editor
 * doesn't necessarily need it to the function (it's just a nice-to-have),
 * and (2) it has nothing to do with the global state.
 */
import docstyle from "../ui/styles/Editor.module.scss";
import app from "../ui/styles/App.module.scss";
import { useEditor } from "@hooks/useEditor";
import { useModal } from "@hooks/useModal";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isAtNodeEnd,
  $patchStyleText,
  $wrapNodes,
} from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $findMatchingParent } from "@lexical/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { command, concat } from "src/util";
import { INSERT_EXCALIDRAW_COMMAND } from "./Draw";
import { Dropdown, Option } from "./Dropdown";
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
} from "./Icon";
import { InsertImageDialog } from "./Image";
import { InsertLatexDialog } from "./Latex";
import { PlotPrompt } from "./Plot2d";
import { Plot3DPrompt } from "./Plot3d/plot3d.prompt";
import { ParametricPlotPrompt } from "./PlotParametric/parametric.prompt";
import { SheetPrompt } from "./Sheet/sheet.prompt";
import { schema } from "./EditorConfig";
import { range } from "src/algom";
import { ColorPicker } from "./colorpicker.chip";
import { Button } from "./Inputs";

/* ------------------------ Substate: Toolbar Context ----------------------- */
type FontVariant = "normal" | "small-caps";
type FontStyle = "bold" | "italic" | "underline" | "strikethrough";
type Alignment = "left" | "center" | "right" | "justify";
interface ToolbarCtx {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCrossed: boolean;
  isLink: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  smallcaps: FontVariant;
  insertLink: () => void;
  fontFamily: string;
  fontSize: string;
  fontColor: string;
  blockType: Blocktype;
  selectedElementKey: string | null;
  enstyle: (styles: Record<string, string>) => void;
  entext: (type: FontStyle) => () => boolean;
  align: (type: Alignment) => () => boolean;
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

type pToolbarPlugin = {
  defaultFontSize?: string;
  defaultFontFamily?: string;
  defaultFontColor?: string;
  defaultBgColor?: string;
  defaultVariant?: "normal" | "small-caps";
};

export function ToolbarPlugin({
  defaultFontSize = "14px",
  defaultFontFamily = "KaTeX_Main",
  defaultFontColor = "black",
  defaultBgColor = "white",
  defaultVariant = "normal",
}: pToolbarPlugin) {
  const { initEditor, activeEditor, setActiveEditor } = useEditor();
  const [blockType, setBlocktype] = useState<Blocktype>("paragraph");
  const [
    selectedElementKey,
    setSelectedElementKey,
  ] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [fontFamily, setFontFamily] = useState(defaultFontFamily);
  const [
    smallcaps,
    setSmallcaps,
  ] = useState<FontVariant>(defaultVariant);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCrossed, setIsCrossed] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);

  const [bgColor, setBgColor] = useState(defaultBgColor);
  const [fontColor, setFontColor] = useState(defaultFontColor);
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

      /** Handle link selection type */
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      /** Handle list selection type */
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(
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
        }
      }

      /** Handle buttons */
      setSmallcaps(
        $getSelectionStyleValueForProperty(
          selection,
          "font-variant",
          defaultVariant,
        ) as FontVariant,
      );
      setFontSize(
        $getSelectionStyleValueForProperty(
          selection,
          "font-size",
          defaultFontSize,
        ),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(
          selection,
          "color",
          defaultFontColor,
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(
          selection,
          "font-family",
          defaultFontFamily,
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

  const enstyle = useCallback((styles: Record<string, string>) => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);

        // ensures the font-variant toggles between normal and small-caps
        (styles["font-variant"]) && setSmallcaps(
          styles["font-variant"] as FontVariant,
        );
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
    isLink,
    smallcaps,
    enstyle,
    insertLink,
    isCrossed,
    isSubscript,
    isSuperscript,
    selectedElementKey,
    blockType,
    entext: (type) => () =>
      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, type),
    align: (type) => () =>
      activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type),
  };

  return (
    <ToolbarContext.Provider value={ctxObject}>
      <div className={concat(app.editor, app.toolbar)}>
        <CoreFormat />
        <FontSizer />
        <FontColor />
        <FontFamilyFormat />
        <BlockTypeDropdown />
        <FigureDropdown />
      </div>
    </ToolbarContext.Provider>
  );
}

type pSlotLabel = {
  children: JSX.Element[];
};

function SlotLabel({ children }: pSlotLabel) {
  return (
    <div className={app.slot_label}>
      <label className={app.slot_left}>{children[0]}</label>
      {children[1]}
    </div>
  );
}

function FontColor() {
  const { fontColor, enstyle } = useContext(ToolbarContext);

  const setColor = useCallback(
    (color: string) => enstyle({ color }),
    [enstyle],
  );

  return (
    <Dropdown
      selfClose={false}
      className={app.fontcolor_dropdown}
      title={
        <SlotLabel>
          <label>Color</label>
          <div
            className={app.fontcolor_dropdown_preview}
            style={{ backgroundColor: fontColor }}
          />
        </SlotLabel>
      }
    >
      <ColorPicker onChange={setColor} />
    </Dropdown>
  );
}

const fontSizes: Record<string, string> = range(
  schema.fontsize.min,
  schema.fontsize.max + 1,
).reduce(
  (p, c) => Object.assign(p, { [`${c}px`]: `${c}px` }),
  {},
);

function FontSizer() {
  const { fontSize, enstyle } = useContext(ToolbarContext);
  const setFont = (size: string) => () => {
    enstyle({ "font-size": size });
  };

  return (
    <Dropdown
      className={app.fontsize_dropdown}
      title={
        <SlotLabel>
          <label>Font Size</label>
          <div>
            {fontSizes[fontSize].slice(0, 2)}
          </div>
        </SlotLabel>
      }
    >
      {Object.entries(fontSizes).map(([k, v]) => (
        <Option
          key={`font${k}`}
          label={k.slice(0, 2)}
          click={setFont(v)}
        />
      ))}
    </Dropdown>
  );
}
function FontFamilyFormat() {
  const { fontFamily, enstyle } = useContext(ToolbarContext);
  const setFontFamily = (fontFamily: string) => () => {
    enstyle({ "font-family": fontFamily });
  };
  return (
    <Dropdown
      className={app.fontfam_dropdown}
      title={
        <SlotLabel>
          <span>{"Font family"}</span>
          <span style={{ fontFamily }}>
            {schema.fontFamilies[fontFamily]}
          </span>
        </SlotLabel>
      }
    >
      {Object.entries(schema.fontFamilies).map(([k]) => (
        <Option
          key={`font-family${k}`}
          label={
            <span style={{ fontFamily: k }}>{schema.fontFamilies[k]}</span>
          }
          click={setFontFamily(k)}
        />
      ))}
    </Dropdown>
  );
}

function FigureDropdown() {
  const { activeEditor } = useEditor();
  const [modal, showModal] = useModal();

  return (
    <>
      <Dropdown title={"Figure"}>
        <Option
          label={"Plot2D"}
          icon={<Plot1Icon />}
          click={() =>
            showModal((close) => (
              <PlotPrompt
                activeEditor={activeEditor}
                onClose={close}
              />
            ))}
        />
        <Option
          label={"Parametric Plot"}
          icon={<ParametricIcon />}
          click={() =>
            showModal((close) => (
              <ParametricPlotPrompt
                activeEditor={activeEditor}
                onClose={close}
              />
            ))}
        />
        <Option
          label={"Plot3D"}
          icon={<Plot3DIcon />}
          click={() =>
            showModal((close) => (
              <Plot3DPrompt
                activeEditor={activeEditor}
                onClose={close}
              />
            ))}
        />
        <Option
          label={"Image"}
          icon={<ImageIcon />}
          click={() =>
            showModal((close) => (
              <InsertImageDialog
                activeEditor={activeEditor}
                onClose={close}
              />
            ))}
        />
        <Option
          label={"Equation"}
          icon={<EquationIcon />}
          click={() =>
            showModal((close) => (
              <InsertLatexDialog
                activeEditor={activeEditor}
                onClose={close}
              />
            ))}
        />
        <Option
          label={"Sheet"}
          click={() =>
            showModal((close) => (
              <SheetPrompt activeEditor={activeEditor} onClose={close} />
            ))}
        />
        <Option
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
        $isRangeSelection(selection) && $wrapNodes(
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
    <Dropdown title={blocktypeMap[blockType]}>
      <Option label={"Paragraph"} click={makeBlock("paragraph")} />
      <Option label={"Quote"} click={makeBlock("quote")} />
      <Option label={"Heading 1"} click={makeBlock("h1")} />
      <Option label={"Heading 2"} click={makeBlock("h2")} />
      <Option label={"Heading 3"} click={makeBlock("h3")} />
      <Option label={"Heading 4"} click={makeBlock("h4")} />
      <Option label={"Heading 5"} click={makeBlock("h5")} />
      <Option label={"Heading 6"} click={makeBlock("h6")} />
      <Option label={"Numbered List"} click={makeList("number")} />
      <Option label={"Bulleted List"} click={makeList("bullet")} />
    </Dropdown>
  );
}

/** Returns the selected node. */
function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  return (anchorNode === focusNode)
    ? anchorNode
    : $isAtNodeEnd(selection.isBackward() ? focus : anchor)
    ? anchorNode
    : focusNode;
}

function CoreFormat() {
  const { entext, align } = useContext(ToolbarContext);
  return (
    <>
      <Button
        label={<BoldIcon />}
        click={entext("bold")}
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
        label={<StrikeIcon />}
        click={entext("strikethrough")}
        className={docstyle.toolbarButton}
      />
      <SmallCapsToggle />
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
    </>
  );
}

function SmallCapsToggle() {
  const {
    enstyle,
    smallcaps,
    fontFamily,
  } = useContext(ToolbarContext);
  return (
    <Button
      label={
        <span style={{ fontFamily }} className={app.small_caps}>
          {"abc"}
        </span>
      }
      click={() =>
        enstyle({
          "font-variant": `${smallcaps === "normal" ? "small-caps" : "normal"}`,
        })}
    />
  );
}
