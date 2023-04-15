import {
  $applyNodeReplacement,
  createCommand,
  DecoratorNode,
  LexicalCommand,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { lazy, Suspense } from "react";
import { Triple } from "src/App";
import { InsertPlot3DPayload, Plot3dProps } from "./plot3d.chip.js";

const Plot3d = lazy(() => import("./plot3d.chip.js"));

export type SerializedPlot3DNode = Spread<
  Plot3dProps & {
    key?: NodeKey;
    type: "plot3d";
    version: 1;
  },
  SerializedLexicalNode
>;

export class Plot3DNode extends DecoratorNode<JSX.Element> {
  __z_expression: string;
  __fov: number;
  __position: Triple<number>;
  __near: number;
  __segments: number;
  __far: number;
  __xMin: number;
  __xMax: number;
  __yMin: number;
  __yMax: number;
  __xRange: number;
  __yRange: number;
  __scale: number;
  __width: number;
  __height: number;
  __gridColor: string;

  constructor(
    z_expression: string,
    segments?: number,
    fov?: number,
    position?: Triple<number>,
    near?: number,
    far?: number,
    xMin?: number,
    xMax?: number,
    yMin?: number,
    yMax?: number,
    xRange?: number,
    yRange?: number,
    scale?: number,
    width?: number,
    height?: number,
    gridColor?: string,
    nodeKey?: NodeKey,
  ) {
    super(nodeKey);
    this.__z_expression = z_expression;
    this.__segments = segments || 100;
    this.__fov = fov || 60;
    this.__position = position || [12, 5, 12];
    this.__near = near || 0.1;
    this.__far = far || 30;
    this.__xMin = xMin || -10;
    this.__xMax = xMax || 10;
    this.__yMin = yMin || -10;
    this.__yMax = yMax || 10;
    this.__xRange = xRange || this.__xMax - this.__xMin;
    this.__yRange = yRange || this.__yMax - this.__yMin;
    this.__scale = scale || 0.3;
    this.__width = width || 500;
    this.__height = height || 500;
    this.__gridColor = gridColor || "lightgrey";
  }

  exportJSON(): SerializedPlot3DNode {
    return {
      z_expression: this.__z_expression,
      fov: this.__fov,
      position: this.__position,
      near: this.__near,
      far: this.__far,
      segments: this.__segments,
      xMin: this.__xMin,
      xMax: this.__xMax,
      yMin: this.__yMin,
      yMax: this.__yMax,
      xRange: this.__xRange,
      yRange: this.__yRange,
      scale: this.__scale,
      width: this.__width,
      height: this.__height,
      gridColor: this.__gridColor,
      type: "plot3d",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedPlot3DNode): Plot3DNode {
    const {
      z_expression,
      segments,
      fov,
      position,
      near,
      far,
      xMin,
      xMax,
      yMin,
      yMax,
      xRange,
      yRange,
      scale,
      width,
      height,
      gridColor,
    } = serializedNode;
    const node = $createPlot3DNode({
      z_expression,
      segments,
      fov,
      position,
      near,
      far,
      xMin,
      xMax,
      yMin,
      yMax,
      xRange,
      yRange,
      scale,
      width,
      height,
      gridColor,
    });
    return node;
  }
  static getType() {
    return "plot3d";
  }

  static clone(node: Plot3DNode): Plot3DNode {
    return new Plot3DNode(
      node.__z_expression,
      node.__segments,
      node.__fov,
      node.__position,
      node.__near,
      node.__far,
      node.__xMin,
      node.__xMax,
      node.__yMin,
      node.__yMax,
      node.__xRange,
      node.__yRange,
      node.__scale,
      node.__width,
      node.__height,
      node.__gridColor,
      node.__key,
    );
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
        <Plot3d
          z_expression={this.__z_expression}
          segments={this.__segments}
          fov={this.__fov}
          position={this.__position}
          near={this.__near}
          far={this.__far}
          xMin={this.__xMin}
          xMax={this.__xMax}
          xRange={this.__xRange}
          yRange={this.__yRange}
          scale={this.__scale}
          width={this.__width}
          height={this.__height}
          gridColor={this.__gridColor}
        />
      </Suspense>
    );
  }
}

export function $createPlot3DNode({
  z_expression,
  segments,
  fov,
  position,
  near,
  far,
  xMin,
  xMax,
  yMin,
  yMax,
  xRange,
  yRange,
  scale,
  width,
  height,
  gridColor,
}: Plot3dProps): Plot3DNode {
  return $applyNodeReplacement(
    new Plot3DNode(
      z_expression,
      segments,
      fov,
      position,
      near,
      far,
      xMin,
      xMax,
      yMin,
      yMax,
      xRange,
      yRange,
      scale,
      width,
      height,
      gridColor,
    ),
  );
}

export const INSERT_PLOT3D_COMMAND: LexicalCommand<InsertPlot3DPayload> =
  createCommand("INSERT_PLOT3D_COMMAND");
