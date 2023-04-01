import {
  $applyNodeReplacement,
  createCommand,
  DecoratorNode,
  LexicalCommand,
  NodeKey,
} from "lexical";
import { lazy, Suspense } from "react";
import {
  FuncExprPayload,
  PlotNodePayload,
  PlotPayload,
  SerializedPlotNode,
} from "./plot2d.chip";


const Plot1 = lazy(() => import("./plot2d.chip"));

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
      <Suspense fallback={null}>
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
      </Suspense>
    );
  }
}

export function $createPlotNode({
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

export type InsertPlotPayload = Readonly<PlotPayload>;
export const INSERT_PLOT_COMMAND: LexicalCommand<InsertPlotPayload> =
  createCommand("INSERT_PLOT_COMMAND");
