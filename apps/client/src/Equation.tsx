import "katex/dist/katex.css";
import katex from "katex";

import { TextMatchTransformer } from "@lexical/markdown";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  KEY_ESCAPE_COMMAND,
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
import { mergeRegister } from "@lexical/utils";
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
          (payload) => {
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
          (payload) => {
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

  useEffect(() => {
    const katexElement = katexElementRef.current;

    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline, // true === block display //
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  return (
    // We use spacers either side to ensure Android doesn't try and compose from the
    // inner text from Katex. There didn't seem to be any other way of making this work,
    // without having a physical space.
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
  export: (node, exportChildren, exportFormat) => {
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
