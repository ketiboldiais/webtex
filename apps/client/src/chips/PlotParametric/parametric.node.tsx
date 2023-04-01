import {
  $applyNodeReplacement,
  createCommand,
  DecoratorNode,
  LexicalCommand,
  NodeKey,
} from "lexical";
import { lazy, Suspense } from "react";
import { Pair, Quad } from "src/App";
import {
  Parametric_Function_Payload,
  ParametricPlotProps,
  SerializedParametricPlotNode,
} from "./parametric.chip";

const PlotParametric = lazy(() => import("./parametric.chip.js"));

export const PARAMETRIC_TYPE = "parametric_plot" as const;

export class ParametricPlotNode extends DecoratorNode<JSX.Element> {
  __functions: Parametric_Function_Payload[];
  __ticks: number;
  __domain: Pair<number>;
  __width: number;
  __height: number;
  __cwidth: number;
  __cheight: number;
  __margins: Quad<number>;

  static getType(): string {
    return PARAMETRIC_TYPE;
  }

  static clone(node: ParametricPlotNode): ParametricPlotNode {
    return new ParametricPlotNode(
      node.__functions,
      node.__ticks,
      node.__domain,
      node.__width,
      node.__height,
      node.__cwidth,
      node.__cheight,
      node.__margins,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedParametricPlotNode,
  ): ParametricPlotNode {
    const {
      functions,
      ticks,
      domain,
      width,
      height,
      cwidth,
      cheight,
      margins,
    } = serializedNode;
    return $createParametricPlotNode({
      functions,
      ticks,
      domain,
      width,
      height,
      cwidth,
      cheight,
      margins,
    });
  }

  exportJSON(): SerializedParametricPlotNode {
    return {
      functions: this.__functions,
      ticks: this.__ticks,
      domain: this.__domain,
      width: this.__width,
      height: this.__height,
      cwidth: this.__cwidth,
      cheight: this.__cheight,
      type: PARAMETRIC_TYPE,
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  constructor(
    functions: Parametric_Function_Payload[],
    ticks?: number,
    domain?: Pair<number>,
    width?: number,
    height?: number,
    cwidth?: number,
    cheight?: number,
    margins?: Quad<number>,
    nodeKey?: NodeKey,
  ) {
    super(nodeKey);
    this.__functions = functions;
    this.__ticks = ticks || 10;
    this.__domain = domain || [-10, 10];
    this.__width = width || 500;
    this.__height = height || 500;
    this.__cwidth = cwidth || 100;
    this.__cheight = cheight || (this.__height / this.__width);
    this.__margins = margins || [30, 30, 30, 30];
  }

  decorate(): JSX.Element {
    return (
      <Suspense>
        <PlotParametric
          functions={this.__functions}
          ticks={this.__ticks}
          domain={this.__domain}
          width={this.__width}
          height={this.__height}
          cwidth={this.__cwidth}
          cheight={this.__cheight}
          margins={this.__margins}
          uid={this.__key + PARAMETRIC_TYPE}
        />
      </Suspense>
    );
  }
}

export function $createParametricPlotNode({
  functions,
  ticks,
  domain,
  width,
  height,
  cwidth,
  cheight,
  margins,
}: ParametricPlotProps): ParametricPlotNode {
  return $applyNodeReplacement(
    new ParametricPlotNode(
      functions,
      ticks,
      domain,
      width,
      height,
      cwidth,
      cheight,
      margins,
    ),
  );
}

export const INSERT_PARAMETRIC_PLOT_COMMAND: LexicalCommand<
  ParametricPlotProps
> = createCommand("INSERT_PARAMETRIC_PLOT_COMMAND");
