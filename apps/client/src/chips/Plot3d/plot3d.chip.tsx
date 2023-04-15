import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { createFunction, makeFunction } from "@webtex/algom";
import { AxesHelper, DoubleSide, GridHelper, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { Figure } from "../PlotUtils";

export type Plot3dProps = {
  z_expression: string;
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

export interface Plot3dPathProps {
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

export default function Plot3d({
  z_expression,
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
  const ZFN: Function | string = createFunction(z_expression);
  if (typeof ZFN === "string") {
    return <p>compiler failure</p>;
  }
  const Z = ZFN;
  const paramFunction = (x: number, y: number, target: Vector3) => {
    x = xRange * x + xMin;
    y = yRange * y + yMin;
    let zVal = Z(x, y);
    if (Number.isNaN(zVal)) return target.set(0.001, 0.001, 0.001);
    const z = target.set(x, zVal, y);
    return z;
  };
  return (
    <Figure
      width={width}
      height={height}
      minWidth={100}
      minHeight={100}
      maxWidth={800}
      maxHeight={800}
    >
      <div style={{ ...canvasSize, margin: "auto", padding: "1em" }}>
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
    </Figure>
  );
}

export type InsertPlot3DPayload = Readonly<Plot3dProps>;
