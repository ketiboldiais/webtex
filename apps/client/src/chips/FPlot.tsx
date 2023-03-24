import {
  $applyNodeReplacement,
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  createCommand,
  DecoratorNode,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { useEffect, useState } from "react";
import { Table } from "./DataTable";
import { nanoid } from "@reduxjs/toolkit";
import plot from "../ui/styles/Plot.module.scss";
import TeX from "@matejmazur/react-katex";
import { algom } from "src/algom";
import { Interval } from "./Interval";
import { Plot1 } from "./Plot2";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { command } from "src/util";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";

const uid = nanoid(7);

type FuncExprPayload = {
  variable: string;
  expression: string;
};
export type SerializedPlotNode = Spread<{
  functions: FuncExprPayload[];
  ticks?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
  key?: NodeKey;
  type: "plot";
  version: 1;
}, SerializedLexicalNode>;

export interface PlotNodePayload {
  functions: FuncExprPayload[];
  ticks?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
}

export class PlotNode extends DecoratorNode<JSX.Element> {
  __functions: FuncExprPayload[];
  __ticks: number;
  __domain: [number, number];
  __range: [number, number];
  __width: number;
  __height: number;
  __cwidth: number;
  __cheight: number;
  __margins: [number, number, number, number];
  static importJSON(serializedNode: SerializedPlotNode): PlotNode {
    const {
      functions,
      ticks,
      domain,
      range,
      width,
      height,
      cwidth,
      cheight,
      margins,
    } = serializedNode;
    const node = $createPlotNode({
      functions,
      ticks,
      domain,
      range,
      width,
      height,
      cwidth,
      cheight,
      margins,
    });
    return node;
  }
  static getType() {
    return "plot";
  }
  static clone(node: PlotNode): PlotNode {
    return new PlotNode(
      node.__functions,
      node.__ticks,
      node.__domain,
      node.__range,
      node.__width,
      node.__height,
      node.__cwidth,
      node.__cheight,
      node.__margins,
      node.__key,
    );
  }
  jsonFunctions() {
    const fs = this.__functions.map((d) => JSON.stringify(d));
    return fs.toString();
  }
  exportJSON(): SerializedPlotNode {
    return {
      functions: this.__functions,
      ticks: this.__ticks,
      domain: this.__domain,
      range: this.__range,
      width: this.__width,
      height: this.__height,
      cwidth: this.__cwidth,
      cheight: this.__cheight,
      margins: this.__margins,
      type: "plot",
      version: 1,
    };
  }
  constructor(
    functions: FuncExprPayload[],
    ticks?: number,
    domain?: [number, number],
    range?: [number, number],
    width?: number,
    height?: number,
    cwidth?: number,
    cheight?: number,
    margins?: [number, number, number, number],
    nodeKey?: NodeKey,
  ) {
    super(nodeKey);
    this.__functions = functions;
    this.__ticks = ticks || 10;
    this.__domain = domain || [-10, 10];
    this.__range = range || [-10, 10];
    this.__width = width || 500;
    this.__height = height || 500;
    this.__cwidth = cwidth || 100;
    this.__cheight = cheight || (this.__height / this.__width);
    this.__margins = margins || [30, 30, 30, 30];
  }
  updateDOM() {
    return false;
  }
  createDOM() {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }
  decorate(): JSX.Element {
    return (
      <Plot1
        fs={this.__functions}
        ticks={this.__ticks}
        domain={this.__domain}
        range={this.__range}
        width={this.__width}
        height={this.__height}
        cwidth={this.__cwidth}
        cheight={this.__cheight}
        margins={this.__margins}
      />
    );
  }
}

export interface PlotPayload {
  functions: FuncExprPayload[];
  ticks: number;
  domain: Pair<number>;
  range: Pair<number>;
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
}

interface InsertPlotProps {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}

export function InsertPlotDialog({ activeEditor, onClose }: InsertPlotProps) {
  const [domain, setDomain] = useState<Pair<number>>([-10, 10]);
  const [range, setRange] = useState<Pair<number>>([-10, 10]);
  const [data, setData] = useState<FuncExprPayload[]>([]);
  const save = () => {
    activeEditor.dispatchCommand(INSERT_PLOT_COMMAND, {
      functions: data,
      ticks: 10,
      domain,
      range,
    });
    onClose();
  };
  return (
    <div className={plot.plot}>
      <Table
        data={data}
        onUpdate={setData}
        uid={uid}
        keys={["variable", "expression"]}
        cell={(c) => <TeX math={algom.toLatex(c)} />}
        schema={{
          variable: { label: "Variable" },
          expression: { label: "Expression" },
        }}
      />
      <Interval
        label={"Domain"}
        value={domain}
        onChange={setDomain}
        minLabel={"x₀"}
        maxLabel={"x₁"}
      />
      <Interval
        label={"Range"}
        value={range}
        onChange={setRange}
        minLabel={"y₀"}
        maxLabel={"y₁"}
      />
      <button onClick={save} className={plot.save}>Save</button>
    </div>
  );
}

export type InsertPlotPayload = Readonly<PlotPayload>;
export const INSERT_PLOT_COMMAND: LexicalCommand<InsertPlotPayload> =
  createCommand("INSERT_PLOT_COMMAND");

export function PlotPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PlotNode])) {
      throw new Error(`PlotPlugin: PlotNode not registered on editor.`);
    }
    const insertPlot = command.priority.editor(
      INSERT_PLOT_COMMAND,
      (payload) => {
        const plotNode = $createPlotNode(payload);
        $insertNodes([plotNode]);
        if ($isRootOrShadowRoot(plotNode.getParentOrThrow())) {
          $wrapNodeInElement(plotNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertPlot));
  }, [editor]);
  return null;
}

function $createPlotNode({
  functions,
  ticks,
  domain,
  range,
  width,
  height,
  cwidth,
  cheight,
  margins,
}: PlotNodePayload): PlotNode {
  return $applyNodeReplacement(
    new PlotNode(
      functions,
      ticks,
      domain,
      range,
      width,
      height,
      cwidth,
      cheight,
      margins,
    ),
  );
}
