import "katex/dist/katex.css";
import katex, { KatexOptions } from "katex";
import app from "../ui/styles/App.module.scss";
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  createCommand,
  DecoratorNode,
  KEY_ESCAPE_COMMAND,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { command } from "src/util";
import { VoidFunction } from "src/App";

const katexSettings = (displayMode: boolean): KatexOptions => ({
  displayMode,
  errorColor: "#cc0000",
  output: "html",
  strict: "warn",
  throwOnError: false,
  trust: false,
});

type PartialLatexNode = {
  type: "latex";
  latex: string;
  inline: boolean;
};

type SLatexNode = Spread<PartialLatexNode, SerializedLexicalNode>;

const data_lexical_latex = "data-lexical-latex";
const data_lexical_inline = "data-lexical-inline";

export function convertLatexElement(domNode: HTMLElement) {
  let latex = domNode.getAttribute(data_lexical_latex);
  const inline = domNode.getAttribute(data_lexical_inline) === "true";
  latex = atob(latex || "");
  if (latex) {
    const node = $createLatexNode(latex, inline);
    return node;
  }
  return null;
}

export class LatexNode extends DecoratorNode<JSX.Element> {
  __latex: string;
  __inline: boolean;

  static getType() {
    return "latex";
  }

  static clone(node: LatexNode): LatexNode {
    return new LatexNode(node.__latex, node.__inline, node.__key);
  }

  static importJSON(snode: SLatexNode): LatexNode {
    const node = $createLatexNode(snode.latex, snode.inline);
    return node;
  }

  exportJSON(): SLatexNode {
    return {
      latex: this.__latex,
      inline: this.__inline,
      type: "latex",
      version: 1,
    };
  }

  createDOM() {
    const element = document.createElement(this.__inline ? "span" : "div");
    element.className = "";
    return element;
  }

  exportDOM() {
    const element = document.createElement(this.__inline ? "span" : "div");
    const latex = btoa(this.__latex);
    element.setAttribute(data_lexical_latex, latex);
    element.setAttribute(data_lexical_inline, `${this.__inline}`);
    katex.render(this.__latex, element, katexSettings(this.__inline));
    return { element };
  }

  static importDOM() {
    return {
      div: (domnode: HTMLElement) => {
        if (!domnode.hasAttribute(data_lexical_latex)) return null;
        return { conversion: convertLatexElement, priority: 2 };
      },
      span: (domnode: HTMLElement) => {
        if (!domnode.hasAttribute(data_lexical_latex)) return null;
        return { conversion: convertLatexElement, priority: 1 };
      },
    };
  }

  updateDOM(prevNode: LatexNode) {
    return this.__inline !== prevNode.__inline;
  }

  getTextContent() {
    return this.__latex;
  }

  getLatex() {
    return this.__latex;
  }

  setLatex(latex: string) {
    const writable = this.getWritable();
    writable.__latex = latex;
  }

  constructor(latex: string, inline = false, key?: NodeKey) {
    super(key);
    this.__latex = latex;
    this.__inline = inline;
  }
  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <LatexComponent
          latex={this.__latex}
          inline={this.__inline}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createLatexNode(latex: string, inline: boolean): LatexNode {
  return $applyNodeReplacement(new LatexNode(latex, inline));
}
export function $isLatexNode(node?: LexicalNode | null): node is LatexNode {
  return node instanceof LatexNode;
}

interface LCP {
  latex: string;
  inline: boolean;
  nodeKey: NodeKey;
}
export function LatexComponent({ latex, inline, nodeKey }: LCP) {
  const [editor] = useLexicalComposerContext();
  const [latexValue, setLatex] = useState(latex);
  const [showLatexEditor, setShowLatexEditor] = useState(false);
  const inputRef = useRef(null);

  const onHide = useCallback((restoreSelection?: boolean) => {
    setShowLatexEditor(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isLatexNode(node)) {
        node.setLatex(latexValue);
        if (restoreSelection) {
          node.selectNext(0, 0);
        }
      }
    });
  }, [editor, latexValue, nodeKey]);

  useEffect(() => {
    if (!showLatexEditor && latexValue !== latex) {
      setLatex(latex);
    }
  }, [showLatexEditor, latex, latexValue]);

  useEffect(() => {
    const handleSelect = command.priority.high(
      SELECTION_CHANGE_COMMAND,
      () => {
        const active = document.activeElement;
        const input = inputRef.current;
        if (input !== active) onHide();
        return false;
      },
    );
    const handleEscape = command.priority.high(
      KEY_ESCAPE_COMMAND,
      () => {
        const active = document.activeElement;
        const input = inputRef.current;
        if (input === active) {
          onHide(true);
          return true;
        }
        return false;
      },
    );
    if (showLatexEditor) {
      return mergeRegister(
        editor.registerCommand(...handleSelect),
        editor.registerCommand(...handleEscape),
      );
    }
    return editor.registerUpdateListener(({ editorState }) => {
      const isSelected = editorState.read(() => {
        const selection = $getSelection();
        return (
          $isNodeSelection(selection) &&
          selection.has(nodeKey) &&
          selection.getNodes().length === 1
        );
      });
      if (isSelected) setShowLatexEditor(true);
    });
  }, [editor, nodeKey, onHide, showLatexEditor]);
  const onClick = () => setShowLatexEditor(true);
  return (
    <>
      {showLatexEditor
        ? (
          <LatexEditor
            latex={latex}
            setLatex={setLatex}
            inline={inline}
          />
        )
        : <LatexRenderer latex={latex} inline={inline} onClick={onClick} />}
    </>
  );
}

import LatexEditor from "./LatexEditor";

type LR = Readonly<{ latex: string; inline: boolean; onClick: VoidFunction }>;

export function LatexRenderer({ latex, inline, onClick }: LR) {
  const katexElementRef = useRef(null);
  useEffect(() => {
    const element = katexElementRef.current;
    if (element !== null) {
      katex.render(latex, element, katexSettings(!inline));
    }
  }, [latex, inline]);
  return (
    <span
      role={"button"}
      tabIndex={-1}
      onDoubleClick={onClick}
      ref={katexElementRef}
    />
  );
}

type LatexPayload = {
  latex: string;
  inline: boolean;
};
export const INSERT_LATEX_COMMAND: LexicalCommand<LatexPayload> = createCommand(
  "INSERT_LATEX_COMMAND",
);

export function LatexPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([LatexNode])) {
      throw new Error("LatexPlugin: LatexNode unregistered.");
    }
    return editor.registerCommand(...command.priority.editor(
      INSERT_LATEX_COMMAND,
      (payload) => {
        const { latex, inline } = payload;
        const node = $createLatexNode(latex, inline);
        $insertNodes([node]);
        if ($isRootOrShadowRoot(node.getParentOrThrow())) {
          $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        }
        return true;
      },
    ));
  }, [editor]);
  return null;
}

interface ILD {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}
export function InsertLatexDialog({ activeEditor, onClose }: ILD) {
  const onConfirm = useCallback(
    (latex: string, inline: boolean) => {
      activeEditor.dispatchCommand(INSERT_LATEX_COMMAND, { latex, inline });
      onClose();
    },
    [activeEditor, onClose],
  );
  return <LatexModifier onConfirm={onConfirm} />;
}

interface LMP {
  initLatex?: string;
  onConfirm: (latex: string, inline: boolean) => void;
}
export function LatexModifier({ initLatex = "", onConfirm }: LMP) {
  const [latex, setLatex] = useState<string>(initLatex);
  const [inline, setInline] = useState<boolean>(false);

  const onClick = useCallback(() => {
    onConfirm(latex, inline);
  }, [onConfirm, latex, inline]);

  const onCheck = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);
  return (
    <div className={app.katex_input_shell}>
      <div className={app.katex_input_options}>
        <div>
          <input type="checkbox" checked={inline} onChange={onCheck} />
          <label>Inline</label>
        </div>
      </div>
      <div className={app.katex_input_main}>
        <label>LaTeX Input</label>
        {inline
          ? (
            <input
              className={app.katex_input_inline_input}
              onChange={(e) => setLatex(e.target.value)}
              value={latex}
            />
          )
          : (
            <textarea
              onChange={(e) => setLatex(e.target.value)}
              value={latex}
              className={app.katex_input_text_area}
            />
          )}
      </div>
      <div className={app.katex_input_preview}>
        <label>Preview</label>
        <div className={app.katex_input_preview_box}>
          <LatexRenderer
            latex={latex}
            inline={false}
            onClick={() => null}
          />
        </div>
      </div>
      <div className={app.katex_input_footer}>
        <button className={app.modal_save} onClick={onClick}>
          Save
        </button>
      </div>
    </div>
  );
}
