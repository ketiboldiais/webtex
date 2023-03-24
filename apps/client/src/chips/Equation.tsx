import "katex/dist/katex.css";
import katex, { KatexOptions } from "katex";

import { TextMatchTransformer } from "@lexical/markdown";
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  KEY_ESCAPE_COMMAND,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  ChangeEvent,
  RefObject,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

function convertEquationElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  let equation: string | null = domNode.getAttribute(
    "data-lexical-equation",
  );
  const inline = domNode.getAttribute("data-lexical-inline") === "true";
  equation = window.atob(equation || "");
  if (equation) {
    const node = $createEquationNode(equation, inline);
    return { node };
  }
  return null;
}

export type SerializedEquationNode = Spread<{
  equation: string;
  inline: boolean;
}, SerializedLexicalNode>;

export class EquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  __inline: boolean;
  constructor(equation: string, inline?: boolean, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }
  static getType(): string {
    return "equation";
  }
  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }
  static importJSON(serializedNode: SerializedEquationNode): EquationNode {
    const node = $createEquationNode(
      serializedNode.equation,
      serializedNode.inline,
    );
    return node;
  }
  exportJSON(): SerializedEquationNode {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: "equation",
      version: 1,
    };
  }
  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement(this.__inline ? "span" : "div");
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__inline ? "span" : "div");
    const equation = window.btoa(this.__equation);
    element.setAttribute("data-lexical-equation", equation);
    element.setAttribute("data-lexical-inline", `${this.__inline}`);
    katex.render(this.__equation, element, {
      displayMode: !this.__inline,
      errorColor: "#cc000",
      output: "html",
      strict: "warn",
      throwOnError: false,
      trust: false,
    });
    return { element };
  }
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) return null;
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) return null;
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
    };
  }
  updateDOM(prevNode: EquationNode): boolean {
    return this.__inline !== prevNode.__inline;
  }
  getEquation(): string {
    return this.__equation;
  }
  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }
  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <EquationComponent
          equation={this.__equation}
          inline={this.__inline}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createEquationNode(
  equation = "",
  inline = false,
): EquationNode {
  const equationNode = new EquationNode(equation, inline);
  return $applyNodeReplacement(equationNode);
}

export function $isEquationNode(
  node: LexicalNode | null | undefined,
): node is EquationNode {
  return node instanceof EquationNode;
}
type EquationProps = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
};
function EquationComponent({ equation, inline, nodeKey }: EquationProps) {
  const [editor] = useLexicalComposerContext();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputRef = useRef(null);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey],
  );
  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);
  useEffect(() => {
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (_payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          (_payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH,
        ),
      );
    } else {
      return editor.registerUpdateListener(({ editorState }) => {
        const isSelected = editorState.read(() => {
          const selection = $getSelection();
          return (
            $isNodeSelection(selection) &&
            selection.has(nodeKey) &&
            selection.getNodes().length === 1
          );
        });
        if (isSelected) {
          setShowEquationEditor(true);
        }
      });
    }
  }, [editor, nodeKey, onHide, showEquationEditor]);

  return (
    <>
      {showEquationEditor
        ? (
          <EquationEditor
            equation={equationValue}
            setEquation={setEquationValue}
            inline={inline}
            inputRef={inputRef}
          />
        )
        : (
          <KatexRenderer
            equation={equationValue}
            inline={inline}
            onClick={() => {
              setShowEquationEditor(true);
            }}
          />
        )}
    </>
  );
}

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  inputRef: { current: null | HTMLInputElement | HTMLTextAreaElement };
  setEquation: (equation: string) => void;
};

export default function EquationEditor({
  equation,
  setEquation,
  inline,
  inputRef,
}: BaseEquationEditorProps): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  const props = {
    equation,
    inputRef,
    onChange,
  };

  return inline
    ? (
      <InlineEquationEditor
        {...props}
        inputRef={inputRef as RefObject<HTMLInputElement>}
      />
    )
    : (
      <BlockEquationEditor
        {...props}
        inputRef={inputRef as RefObject<HTMLTextAreaElement>}
      />
    );
}

type EquationEditorImplProps = {
  equation: string;
  inputRef: { current: null | HTMLInputElement };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function InlineEquationEditor({
  equation,
  onChange,
  inputRef,
}: EquationEditorImplProps): JSX.Element {
  return (
    <span className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">$</span>
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={inputRef}
      />
      <span className="EquationEditor_dollarSign">$</span>
    </span>
  );
}

type BlockEquationEditorImplProps = {
  equation: string;
  inputRef: { current: null | HTMLTextAreaElement };
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function BlockEquationEditor({
  equation,
  onChange,
  inputRef,
}: BlockEquationEditorImplProps): JSX.Element {
  return (
    <div className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">{"$$\n"}</span>
      <textarea
        className="EquationEditor_blockEditor"
        value={equation}
        onChange={onChange}
        ref={inputRef}
      />
      <span className="EquationEditor_dollarSign">{"\n$$"}</span>
    </div>
  );
}

function KatexRenderer({
  equation,
  inline,
  onClick,
}: Readonly<{
  equation: string;
  inline: boolean;
  onClick: () => void;
}>): JSX.Element {
  const katexElementRef = useRef(null);
  const settings: KatexOptions = {
    displayMode: !inline, // true === block display //
    errorColor: "#cc0000",
    output: "html",
    strict: "warn",
    throwOnError: false,
    trust: false,
  };
  useEffect(() => {
    let katexElement = katexElementRef.current;
    if (katexElement !== null) {
      try {
        katex.render(equation, katexElement, settings);
      } catch (error) {
        katex.render('\\text{Invalid LaTeX entered.}', katexElement, settings);
      }
    }
  }, [equation, inline]);

  return (
    <>
      <span className="spacer"></span>
      <span
        role="button"
        tabIndex={-1}
        onClick={onClick}
        ref={katexElementRef}
      />
      <span className="spacer"></span>
    </>
  );
}

export const EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node, _exportChildren, _exportFormat) => {
    if (!$isEquationNode) return null;
    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export function MathPlugin() {
  return <MarkdownShortcutPlugin transformers={[EQUATION]} />;
}
type TextInputEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type CommandPayload = {
  equation: string;
  inline: boolean;
};
import prompt from "../ui/styles/EquationPrompt.module.scss";
export function KatexEquationAlterer({
  initialEquation = "",
  onConfirm,
}: {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
}) {
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(false);
  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);
  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);
  const updateEqn = (event: TextInputEvent) => {
    setEquation(event.target.value);
  };
  return (
    <div className={prompt.container}>
      <div className={prompt.option}>
        <input
          id={"set-inline"}
          type="checkbox"
          checked={inline}
          onChange={onCheckboxChange}
          className={prompt.checkbox}
        />
        <label className={prompt.checkbox} htmlFor={"set-inline"}>Inline</label>
      </div>
      <div>
        {inline
          ? (
            <input
              className={prompt.inlineInput}
              onChange={updateEqn}
              value={equation}
            />
          )
          : (
            <textarea
              className={prompt.blockInput}
              onChange={updateEqn}
              value={equation}
            />
          )}
      </div>
      <div>
        <KatexRenderer
          equation={equation}
          inline={false}
          onClick={() => null}
        />
      </div>
      <div className={prompt.add}>
        <button className={prompt.add} onClick={onClick}>save</button>
      </div>
    </div>
  );
}

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export function InsertEquationDialog({ activeEditor, onClose }: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}) {
  const onEquationConfirm = useCallback((equation: string, inline: boolean) => {
    activeEditor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
    onClose();
  }, [activeEditor, onClose]);
  return <KatexEquationAlterer onConfirm={onEquationConfirm} />;
}

export function EquationsPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([EquationNode])) {
      throw new Error("EquationPlugin: EquationNode unregistered.");
    }
    return editor.registerCommand<CommandPayload>(
      INSERT_EQUATION_COMMAND,
      (payload) => {
        const { equation, inline } = payload;
        const equationNode = $createEquationNode(equation, inline);
        $insertNodes([equationNode]);
        if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
          $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);
  return null;
}
