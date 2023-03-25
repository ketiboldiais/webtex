import { Canvas, useThree } from "@react-three/fiber";
import plot3d from "../ui/styles/Plot3D.module.scss";
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
import { Suspense, useEffect, useRef, useState } from "react";
import { algom } from "src/algom";
import { AxesHelper, DoubleSide, GridHelper, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { NumberInput, TextInput } from "./Inputs";

type Plot3dProps = {
  z_expression: string;
  x_variable?: string;
  y_variable?: string;
  fov?: number;
  position?: [number, number, number];
  near?: number;
  far?: number;
  segments?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xRange?: number;
  yRange?: number;
  scale?: number;
  width?: number;
  height?: number;
  gridColor?: string;
};

interface Plot3dPathProps {
  paramFunction: ((u: number, v: number, target: Vector3) => void) | undefined;
  scale: number;
  segments: number;
}
function Plot3dPath({ paramFunction, scale, segments }: Plot3dPathProps) {
  const ref = useRef<any>();
  const graph = new ParametricGeometry(paramFunction, segments, segments);
  return (
    <mesh ref={ref} scale={scale} geometry={graph}>
      <meshNormalMaterial side={DoubleSide} />
    </mesh>
  );
}

function CameraController() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

export function Plot3d({
  z_expression,
  x_variable = "x",
  y_variable = "y",
  segments = 100,
  fov = 60,
  position = [12, 5, 12],
  near = 0.1,
  far = 30,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  xRange = xMax - xMin,
  yRange = yMax - yMin,
  scale = 0.3,
  width = 300,
  height = 300,
  gridColor = "lightgrey",
}: Plot3dProps) {
  const canvasSize = { width, height };
  const ZFN: Function | string = algom.makeFunction(z_expression, [
    x_variable,
    y_variable,
  ]);
  if (typeof ZFN === "string") {
    return <>compiler failure</>;
  }
  const Z = ZFN;
  const paramFunction = (x: number, y: number, target: Vector3) => {
    x = xRange * x + xMin;
    y = yRange * y + yMin;
    let zVal = Z(x, y);
    if (isNaN(zVal)) return target.set(0, 0, 0);
    else return target.set(x, zVal, y);
  };
  return (
    <div style={{ ...canvasSize, margin: "auto", padding: "1.2em" }}>
      <Canvas
        camera={{ fov, position, near, far }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <CameraController />
        <pointLight position={[0, 250, 0]} color={0xffffff} />
        <primitive object={new AxesHelper(10)} />
        <primitive object={new GridHelper(10, 10, gridColor, gridColor)} />
        <Plot3dPath
          paramFunction={paramFunction}
          scale={scale}
          segments={segments}
        />
      </Canvas>
    </div>
  );
}

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
  __x_variable: string;
  __y_variable: string;
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
    x_variable?: string,
    y_variable?: string,
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
    this.__x_variable = x_variable || "x";
    this.__y_variable = y_variable || "y";
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
      x_variable: this.__x_variable,
      y_variable: this.__y_variable,
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
      x_variable,
      y_variable,
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
      x_variable,
      y_variable,
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
      node.__x_variable,
      node.__y_variable,
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
          x_variable={this.__x_variable}
          y_variable={this.__y_variable}
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

function $createPlot3DNode({
  z_expression,
  x_variable,
  y_variable,
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
      x_variable,
      y_variable,
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

interface DialogProps {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}

import TeX from "@matejmazur/react-katex";
import { command, concat, toggle } from "src/util";
import { Interval } from "./Interval";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";

export type InsertPlot3DPayload = Readonly<Plot3dProps>;

export function InsertPlot3DDialog({ activeEditor, onClose }: DialogProps) {
  const [z, setZ] = useState("");
  const [fov, setFov] = useState(60);
  const [posX, setPosX] = useState(12);
  const [posY, setPosY] = useState(5);
  const [posZ, setPosZ] = useState(12);
  const [near, setNear] = useState(0.1);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [far, setFar] = useState(30);
  const [segments, setSegments] = useState(100);
  const [xDomain, setXDomain] = useState<Pair<number>>([-10, 10]);
  const [yDomain, setYDomain] = useState<Pair<number>>([-10, 10]);
  const [scale, setScale] = useState(0.3);
  const [showExtra, setShowExtra] = useState(false);
  const save = () => {
    const payload: InsertPlot3DPayload = {
      z_expression: z,
      x_variable: "x",
      y_variable: "y",
      fov,
      position: [posX, posY, posZ],
      near,
      far,
      segments,
      xMin: xDomain[0],
      xMax: xDomain[1],
      yMin: yDomain[0],
      yMax: yDomain[1],
      xRange: xDomain[1] - xDomain[0],
      yRange: yDomain[1] - yDomain[0],
      scale,
      width,
      height,
    };
    activeEditor.dispatchCommand(INSERT_PLOT3D_COMMAND, payload);
    onClose();
  };
  return (
    <div className={plot3d.shell}>
      <TextInput
        label={<TeX math={"z(x,y) = "} />}
        onChange={setZ}
        value={z}
        className={concat(plot3d.row, plot3d.textInput)}
        placeholder={"Enter an expression of variables x and y."}
      />
      <Interval
        label={<TeX math={"x\\text{-domain}"} />}
        value={xDomain}
        onChange={setXDomain}
        minLabel={"x₀"}
        maxLabel={"x₁"}
      />
      <Interval
        label={<TeX math={"y\\text{-domain}"} />}
        value={yDomain}
        onChange={setYDomain}
        minLabel={"y₀"}
        maxLabel={"y₁"}
      />
      <div className={plot3d.footer}>
        <button onClick={() => setShowExtra(!showExtra)}>
          <span
            className={concat(
              plot3d.turnstile,
              toggle(plot3d.showIcon, plot3d.hideIcon).on(showExtra),
            )}
          >
            &#9654;
          </span>
          <span className={plot3d.advancedLabel}>advanced</span>
        </button>
        <button onClick={save} className={plot3d.save}>save</button>
      </div>
      <div
        className={concat(
          plot3d.advanced,
          toggle(plot3d.show, plot3d.hide).on(showExtra),
        )}
      >
        <NumberInput
          label={"scale"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setScale}
          value={scale}
        />
        <div className={concat(plot3d.row, plot3d.cameraPosition)}>
          <label>Camera Position</label>
          <div className={plot3d.cameraRow}>
            <NumberInput
              label={<TeX math={"x"} className={plot3d.texLabel} />}
              className={plot3d.numberInput}
              onChange={setPosX}
              value={posX}
            />
            <NumberInput
              label={<TeX math={"y"} className={plot3d.texLabel} />}
              className={plot3d.numberInput}
              onChange={setPosY}
              value={posY}
            />
            <NumberInput
              label={<TeX math={"z"} className={plot3d.texLabel} />}
              className={plot3d.numberInput}
              onChange={setPosZ}
              value={posZ}
            />
          </div>
        </div>
        <NumberInput
          label={"width"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setWidth}
          value={width}
        />
        <NumberInput
          label={"height"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setHeight}
          value={height}
        />
        <NumberInput
          label={"segments"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setSegments}
          value={segments}
        />
        <NumberInput
          label={"FOV"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setFov}
          value={fov}
        />
        <NumberInput
          label={"near"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setNear}
          value={near}
        />
        <NumberInput
          label={"far"}
          className={concat(plot3d.row, plot3d.numberInput)}
          onChange={setFar}
          value={far}
        />
      </div>
    </div>
  );
}

export function Plot3DPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Plot3DNode])) {
      throw new Error("Plot3DPlugin: Plot3DNode unregistered.");
    }
    const insertPlot3d = command.priority.editor(
      INSERT_PLOT3D_COMMAND,
      (payload) => {
        const plot3dNode = $createPlot3DNode(payload);
        $insertNodes([plot3dNode]);
        if ($isRootOrShadowRoot(plot3dNode.getParentOrThrow())) {
          $wrapNodeInElement(plot3dNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
    );
    return mergeRegister(editor.registerCommand(...insertPlot3d));
  }, [editor]);
  return null;
}
