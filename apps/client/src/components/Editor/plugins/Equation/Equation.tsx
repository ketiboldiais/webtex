import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DecoratorNode,
  KEY_ESCAPE_COMMAND,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
  SerializedLexicalNode,
} from "lexical";
import "katex/dist/katex.min.css";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import katex from "katex";
import {
  ChangeEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import type { TextMatchTransformer } from "@lexical/markdown";

type InputChange = ChangeEvent<HTMLInputElement>;
type TextAreaChange = ChangeEvent<HTMLTextAreaElement>;
type FormChange = InputChange | TextAreaChange;

type InlineEquationEditorProps = {
  equation: string;
  inputRef: { current: null | HTMLInputElement };
  onChange: (event: InputChange) => void;
};

type CoreEquationEditorProps = {
  equation: string;
  inputRef: { current: null | HTMLInputElement | HTMLTextAreaElement };
  setEquation: (text: string) => void;
};

function InlineEquationEditor({
  equation,
  inputRef,
  onChange,
}: InlineEquationEditorProps) {
  return (
    <span>
      <span>$</span>
      <input
        className="InlineEquationEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={inputRef}
      />
      <span>$</span>
    </span>
  );
}

function EquationEditor({
  equation,
  setEquation,
  inputRef,
}: CoreEquationEditorProps) {
  const onChange = (event: FormChange) => {
    setEquation(event.target.value);
  };
  const props = {
    equation,
    inputRef,
    onChange,
  };
  return (
    <InlineEquationEditor
      {...props}
      inputRef={inputRef as RefObject<HTMLInputElement>}
    />
  );
}

type EquationComponentProps = {
  equation: string;
  nodeKey: NodeKey;
};

function KatexRenderer({
  equation,
  onClick,
}: Readonly<{
  equation: string;
  onClick: () => void;
}>): JSX.Element {
  const katexElementRef = useRef(null);
  useEffect(() => {
    const katexElement = katexElementRef.current;
    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: false,
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation]);

  return (
    <>
      <span
        role={"button"}
        tabIndex={-1}
        onClick={onClick}
        ref={katexElementRef}
      ></span>
    </>
  );
}

function EquationComponent({ equation, nodeKey }: EquationComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputRef = useRef(null);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node && $isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey]
  );

  useEffect(() => {
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          () => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        )
      );
    }
    return;
  }, [editor, onHide, showEquationEditor]);

  return (
    <>
      {showEquationEditor ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inputRef={inputRef}
        />
      ) : (
        <KatexRenderer
          equation={equationValue}
          onClick={() => {
            setShowEquationEditor(true);
          }}
        />
      )}
    </>
  );
}

export type Spread<T1, T2> = { [K in Exclude<keyof T1, keyof T2>]: T1[K] } & T2;
export type SerializedEquationNode = Spread<
  {
    type: "equation";
    equation: string;
    block: boolean;
  },
  SerializedLexicalNode
>;

export class EquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  constructor(equation: string, key?: NodeKey) {
    super(key);
    this.__equation = equation;
  }
  static getType(): string {
    return "equation";
  }
  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__key);
  }

  static importJSON(_serializedNode: SerializedEquationNode): EquationNode {
    const node = $createEquationNode(_serializedNode.equation);
    return node;
  }

  exportJSON(): SerializedEquationNode {
    return {
      equation: this.getEquation(),
      block: this.__block,
      type: "equation",
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    return document.createElement(this.__block ? "div" : "span");
  }
  updateDOM(prevNode: EquationNode): boolean {
    return this.__block !== prevNode.__block;
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
      <EquationComponent equation={this.__equation} nodeKey={this.__key} />
    );
  }
}

export function $createEquationNode(text: string): EquationNode {
  return new EquationNode(text);
}

export function $isEquationNode(node?: LexicalNode): boolean {
  return node instanceof EquationNode;
}

type CommandPayload = {
  equation: string;
  block: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

export const EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }
    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$].+?)\$/,
  regExp: /\$([^$].+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export function MathPlugin(): JSX.Element {
  return <MarkdownShortcutPlugin transformers={[EQUATION]} />;
}

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EquationNode])) {
      throw new Error(
        "EquationsPlugins: EquationsNode not registered on editor"
      );
    }

    return editor.registerCommand<CommandPayload>(
      INSERT_EQUATION_COMMAND,
      (payload) => {
        const { equation } = payload;
        const selection = $getSelection();

        if (selection && $isRangeSelection(selection)) {
          const equationNode = $createEquationNode(equation);
          selection.insertNodes([equationNode]);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
