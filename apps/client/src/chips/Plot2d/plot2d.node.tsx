import {
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
import { lazy, Suspense } from "react";
import { PlotFn } from "./plot2d.chip.js";

const Plot2D = lazy(() => import("./plot2d.chip.js"));

type Plot2DPayload = {
  functions: PlotFn[];
  samples: number;
  domain: [number, number];
  range: [number, number];
  width: number;
  height: number;
  ticks: number;
};

type SerialPlot2D = Plot2DPayload & {
  type: "Plot2DNode";
  version: 1;
};

type SerializedPlot2DNode = Spread<SerialPlot2D, SerializedLexicalNode>;

export class Plot2DNode extends DecoratorNode<JSX.Element> {
  __functions: PlotFn[];
  __samples: number;
  __domain: [number, number];
  __range: [number, number];
  __width: number;
  __height: number;
  __ticks: number;

  constructor(
    functions: PlotFn[],
    samples: number,
    domain: [number, number],
    range: [number, number],
    width: number,
    height: number,
    ticks: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__functions = functions;
    this.__samples = samples;
    this.__domain = domain;
    this.__range = range;
    this.__width = width;
    this.__height = height;
    this.__ticks = ticks;
  }

  static getType() {
    return "Plot2DNode";
  }

  static clone(node: Plot2DNode): Plot2DNode {
    return new Plot2DNode(
      node.functions,
      node.samples,
      node.domain,
      node.range,
      node.width,
      node.height,
      node.ticks,
    );
  }

  static importJSON(snode: SerializedPlot2DNode): Plot2DNode {
    return new Plot2DNode(
      snode.functions,
      snode.samples,
      snode.domain,
      snode.range,
      snode.width,
      snode.height,
      snode.ticks,
    );
  }

  exportJSON(): SerializedPlot2DNode {
    return {
      functions: this.__functions,
      samples: this.__samples,
      domain: this.__domain,
      range: this.__range,
      width: this.__width,
      height: this.__height,
      ticks: this.__ticks,
      type: "Plot2DNode",
      version: 1,
    };
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
      <Suspense>
        <Plot2D
          functions={this.__functions}
          domain={this.__domain}
          range={this.__range}
          ticks={this.__ticks}
          width={this.__width}
          height={this.__height}
          samples={this.__samples}
        />
      </Suspense>
    );
  }
}

export function $createPlot2DNode({
  functions,
  samples,
  domain,
  range,
  width,
  height,
  ticks,
}: Plot2DPayload) {
  return new Plot2DNode(
    functions,
    samples,
    domain,
    range,
    width,
    height,
    ticks,
  );
}

export const INSERT_PLOT_2D_COMMAND: LexicalCommand<Plot2DPayload> =
  createCommand(
    "INSERT_PLOT_2D_COMMAND",
  );
