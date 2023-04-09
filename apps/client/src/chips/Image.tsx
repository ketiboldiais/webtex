type HTMLdydx = "inherit" | number;
import app from "../ui/styles/App.module.scss";
import docstyle from "../ui/styles/Editor.module.scss";
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  CLICK_COMMAND,
  createCommand,
  createEditor,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  EditorConfig,
  GridSelection,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { DOM_AVAILABLE, joinRest, toggle } from "src/util";
import { FileInput, Switch, TextInput } from "./Inputs";
import { Resizer } from "./Resizer";
declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

const imageCache = new Set();

function useSuspenseImage(src: string) {
  if (imageCache.has(src)) return;
  throw new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache.add(src);
      resolve(null);
    };
  });
}

function $isImageNode(node: any): node is ImageNode {
  return node instanceof ImageNode;
}

interface LazyImageProps {
  altText: string;
  className: string | null;
  height: HTMLdydx;
  imageRef: { current: null | HTMLImageElement };
  maxWidth: number;
  src: string;
  width: HTMLdydx;
}

function LazyImage({
  altText,
  className,
  height,
  maxWidth,
  imageRef,
  src,
  width,
}: LazyImageProps) {
  useSuspenseImage(src);
  return (
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      style={{
        height,
        maxWidth,
        width,
      }}
      draggable={"false"}
    />
  );
}

interface ImageComponentProps {
  altText: string;
  caption: LexicalEditor;
  height: HTMLdydx;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  width: HTMLdydx;
  src: string;
  captionsEnabled: boolean;
}
type ImageRef = null | HTMLImageElement;
type ButtonRef = null | HTMLButtonElement;
type EditorSelection = RangeSelection | NodeSelection | GridSelection | null;
type EditorRef = LexicalEditor | null;
export function ImageComponent({
  altText,
  caption,
  height,
  maxWidth,
  nodeKey,
  resizable,
  showCaption,
  width,
  src,
  captionsEnabled,
}: ImageComponentProps) {
  const imageRef = useRef<ImageRef>(null);
  const btnRef = useRef<ButtonRef>(null);
  const [
    isSelected,
    setSelected,
    clearSelection,
  ] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<EditorSelection>(null);
  const editorRef = useRef<EditorRef>(null);
  const onDelete = useCallback((payload: KeyboardEvent) => {
    if (!isSelected) return false;
    if (!$isNodeSelection($getSelection())) return false;
    const event: KeyboardEvent = payload;
    event.preventDefault();
    const node = $getNodeByKey(nodeKey);
    if ($isImageNode(node)) node.remove();
    setSelected(false);
    return false;
  }, [isSelected, nodeKey, setSelected]);
  const onEnter = useCallback((event: KeyboardEvent) => {
    const latestSelection = $getSelection();
    const buttonElement = btnRef.current;
    if (!isSelected) return false;
    if (!$isNodeSelection(latestSelection)) return false;
    if (latestSelection.getNodes().length !== 1) return false;
    if (showCaption) {
      $setSelection(null);
      event.preventDefault();
      caption.focus();
      return true;
    }
    if (buttonElement === null) return false;
    if (buttonElement === document.activeElement) return false;
    event.preventDefault();
    buttonElement.focus();
    return true;
  }, [caption, isSelected, showCaption]);

  const onEscape = useCallback((event: KeyboardEvent) => {
    if (editorRef.current !== caption && btnRef.current !== event.target) {
      return false;
    }
    $setSelection(null);
    editor.update(() => {
      setSelected(true);
      const parentRootElement = editor.getRootElement();
      parentRootElement?.focus();
    });
    return true;
  }, [caption, editor, setSelected]);

  useEffect(() => {
    let isMounted = true;
    const handleSelect = command.priority.low(
      SELECTION_CHANGE_COMMAND,
      (_, activeEditor) => {
        editorRef.current = activeEditor;
        return false;
      },
    );
    const handleClick = command.priority.low(
      CLICK_COMMAND,
      (payload) => {
        const event = payload;
        if (isResizing) return true;
        if (event.target !== imageRef.current) return false;
        if (event.shiftKey) setSelected(!isSelected);
        else {
          clearSelection();
          setSelected(true);
        }
        return true;
      },
    );
    const handleDragStart = command.priority.low(
      DRAGSTART_COMMAND,
      (event) => {
        if (event.target !== imageRef.current) return false;
        event.preventDefault();
        return true;
      },
    );

    const deleteKey = command.priority.low(
      KEY_DELETE_COMMAND,
      onDelete,
    );

    const backspaceKey = command.priority.low(
      KEY_BACKSPACE_COMMAND,
      onDelete,
    );

    const enterKey = command.priority.low(
      KEY_ENTER_COMMAND,
      onEnter,
    );

    const escapeKey = command.priority.low(
      KEY_ESCAPE_COMMAND,
      onEscape,
    );

    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (!isMounted) return;
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand(...handleSelect),
      editor.registerCommand(...handleClick),
      editor.registerCommand(...handleDragStart),
      editor.registerCommand(...deleteKey),
      editor.registerCommand(...backspaceKey),
      editor.registerCommand(...enterKey),
      editor.registerCommand(...escapeKey),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    onDelete,
    onEnter,
    onEscape,
    setSelected,
  ]);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isImageNode(node)) return;
      node.setShowCaption(true);
    });
  };

  const onResizeEnd = (nxw: HTMLdydx, nxh: HTMLdydx) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isImageNode(node)) return;
      node.setWidthAndHeight(nxw, nxh);
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const isFocused = isSelected || isResizing;

  const lazyImgClass = useMemo(() => {
    return toggle(
      joinRest(app.image_focused, app.image_draggable)
        .on($isNodeSelection(selection)),
    ).on(isFocused);
  }, [selection, isFocused, isSelected, isResizing]);

  return (
    <Suspense fallback={null}>
      <div draggable={isSelected && $isNodeSelection(selection) && !isResizing}>
        <LazyImage
          className={lazyImgClass}
          src={src}
          altText={altText}
          imageRef={imageRef}
          width={width}
          height={height}
          maxWidth={maxWidth}
        />
      </div>
      {showCaption && (
        <div className={docstyle.image_caption_container}>
          <LexicalNestedComposer initialEditor={caption}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable className={docstyle.image_content_editable} />
              }
              placeholder={<div className={docstyle.image_placeholder}></div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </LexicalNestedComposer>
        </div>
      )}
      {resizable && $isNodeSelection(selection) && isFocused && (
        <Resizer
          showCaption={showCaption}
          setShowCaption={setShowCaption}
          editor={editor}
          buttonRef={btnRef}
          imageRef={imageRef}
          maxWidth={maxWidth}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
          captionsEnabled={captionsEnabled}
        />
      )}
    </Suspense>
  );
}

export interface ImagePayload {
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  width?: number;
  maxWidth?: number;
  key?: NodeKey;
  showCaption?: boolean;
  src: string;
  captionsEnabled?: boolean;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<{
  altText: string;
  caption: SerializedEditor;
  height?: number;
  width?: number;
  maxWidth: number;
  key?: NodeKey;
  showCaption: boolean;
  src: string;
  captionsEnabled?: boolean;
  type: "image";
  version: 1;
}, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: HTMLdydx;
  __height: HTMLdydx;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  __captionsEnabled: boolean;
  static getType(): string {
    return "image";
  }
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, caption, src, showCaption } =
      serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
    });
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("width", this.__altText.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: HTMLdydx,
    height?: HTMLdydx,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__maxWidth = maxWidth;
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: "image",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
    };
  }

  setWidthAndHeight(
    width: HTMLdydx,
    height: HTMLdydx,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  getSrc() {
    return this.__src;
  }

  getAltText() {
    return this.__altText;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          captionsEnabled={this.__captionsEnabled}
          resizable={true}
        />
      </Suspense>
    );
  }
}

/**
 * Creates a new image node.
 * Expects an object of type
 * `ImagePayload`.
 */
function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
    ),
  );
}

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  DOM_AVAILABLE ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

interface ImagePrompt {
  onClick: (payload: InsertImagePayload) => void;
}

export function PromptImageLink({ onClick }: ImagePrompt) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const isDisabled = src === "";
  const save = () => onClick({ altText, src });
  return (
    <div className={app.image_prompt}>
      <TextInput
        label="Image URL"
        onChange={setSrc}
        value={src}
      />
      <TextInput
        label="Description"
        onChange={setAltText}
        value={altText}
      />
      <button disabled={isDisabled} onClick={save} className={app.modal_save}>
        Save
      </button>
    </div>
  );
}

export function PromptImageUpload({ onClick }: ImagePrompt) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const isDisabled = src === "";
  const loadImage = (files: FileList | null) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setSrc(reader.result);
      return "";
    };
    if (files !== null) reader.readAsDataURL(files[0]);
  };

  const save = () => onClick({ altText, src });

  return (
    <div className={app.image_prompt}>
      <FileInput
        onChange={loadImage}
        accept="image/*"
      />
      <TextInput
        label="Description"
        onChange={setAltText}
        value={altText}
      />
      <button disabled={isDisabled} onClick={save} className={app.modal_save}>
        Save
      </button>
    </div>
  );
}

interface ImageDialogProps {
  activeEditor: LexicalEditor;
  onClose: () => void;
}
export function InsertImageDialog({ activeEditor, onClose }: ImageDialogProps) {
  const [isFile, setIsFile] = useState(false);

  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);
  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };
  return (
    <div className={app.image_dialog}>
      <Switch
        onToggle={() => setIsFile(!isFile)}
        value={isFile}
        trueLabel={"File"}
        falseLabel={"URL"}
      />
      {!isFile && <PromptImageLink onClick={onClick} />}
      {isFile && <PromptImageUpload onClick={onClick} />}
    </div>
  );
}

interface ImagePluginProps {
  captionsEnabled?: boolean;
}

import { command } from "src/util";

export function ImagePlugin({ captionsEnabled }: ImagePluginProps) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }
    const insertImage = command.priority.editor(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload);
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    const dragStart = command.priority.high(
      DRAGSTART_COMMAND,
      (event) => onDragStart(event),
    );
    const dragOver = command.priority.low(
      DRAGOVER_COMMAND,
      (event) => onDragover(event),
    );
    const drop = command.priority.high(
      DROP_COMMAND,
      (event) => onDrop(event, editor),
    );
    return mergeRegister(
      editor.registerCommand(...insertImage),
      editor.registerCommand(...dragStart),
      editor.registerCommand(...dragOver),
      editor.registerCommand(...drop),
    );
  }, [captionsEnabled, editor]);
  return null;
}

import { TRANSPARENT_IMAGE } from "src/util";

const img = document.createElement("img");
img.src = TRANSPARENT_IMAGE;

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return false;
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    }),
  );

  return true;
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;
  if (!canDropImage(event)) event.preventDefault();
  return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;
  const data = getDragImageData(event);
  if (!data) return false;
  event.preventDefault();
  if (!canDropImage(event)) return true;
  const range = getDragSelection(event);
  node.remove();
  const rangeSelection = $createRangeSelection();
  if (range !== null && range !== undefined) {
    rangeSelection.applyDOMRange(range);
  }
  $setSelection(rangeSelection);
  editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  return true;
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) return null;
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) return null;
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") return null;
  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("code, span.editor-image") &&
    target.parentElement &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow = target == null
    ? null
    : target.nodeType === 9
    ? (target as Document).defaultView
    : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }
  return range;
}
