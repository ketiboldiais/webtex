import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  createCommand,
  DecoratorNode,
  EditorConfig,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { Suspense, useEffect } from "react";
import _default from "@excalidraw/excalidraw";
import { lazy } from "react";

const ExcalidrawComponent = lazy(() => import("./DrawComponent"));

type Base = { data: string; type: "excalidraw"; version: 1 };
export type SerializedExcalidrawNode = Spread<Base, SerializedLexicalNode>;

const EXCALIDRAW_DATA_ATTRIBUTE = "data-lexical-excalidraw-json";

export function convertExcalidrawElement(domNode: HTMLElement) {
  const excalidrawData = domNode.getAttribute(EXCALIDRAW_DATA_ATTRIBUTE);
  if (excalidrawData) {
    const node = $createExcalidrawNode();
    node.__data = excalidrawData;
    return { node };
  }
  return null;
}

export class ExcalidrawNode extends DecoratorNode<JSX.Element> {
  __data: string;
  static getType() {
    return "excalidraw";
  }
  static clone(node: ExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(node.__data, node.__key);
  }
  static importJSON(serializedNode: SerializedExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(serializedNode.data);
  }
  exportJSON(): SerializedExcalidrawNode {
    return {
      data: this.__data,
      type: "excalidraw",
      version: 1,
    };
  }

  constructor(data = "[]", key?: NodeKey) {
    super(key);
    this.__data = data;
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

  updateDOM(): false {
    return false;
  }

  static importDOM() {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute(EXCALIDRAW_DATA_ATTRIBUTE)) {
          return null;
        }
        return {
          conversion: convertExcalidrawElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(editor: LexicalEditor) {
    const element = document.createElement("span");
    const content = editor.getElementByKey(this.getKey());
    if (content !== null) {
      element.innerHTML = content.querySelector("svg")!.outerHTML;
    }
    element.setAttribute(EXCALIDRAW_DATA_ATTRIBUTE, this.__data);
    return { element };
  }

  setData(data: string) {
    const self = this.getWritable();
    self.__data = data;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ExcalidrawComponent nodeKey={this.getKey()} data={this.__data} />
      </Suspense>
    );
  }
}

export function $createExcalidrawNode(): ExcalidrawNode {
  return new ExcalidrawNode();
}

export function $isExcalidrawNode(
  node: LexicalNode | null | undefined,
): node is ExcalidrawNode {
  return node instanceof ExcalidrawNode;
}

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import { command } from "src/util";

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand();

export function ExcalidrawPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error("ExcalidrawPlugin: ExcalidrawNode unregistered.");
    }
    return editor.registerCommand(...command.priority.editor(
      INSERT_EXCALIDRAW_COMMAND,
      () => {
        const excalidrawNode = $createExcalidrawNode();
        $insertNodes([excalidrawNode]);
        if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
          $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    ));
  }, [editor]);
  return null;
}
