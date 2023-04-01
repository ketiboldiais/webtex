import { useState } from "react";
import { Pair } from "src/App";
import { Detail } from "../Detail";
import { NumberInput, Row, TextInput } from "../Inputs";
import { Interval } from "../Interval";
import { InsertPlot3DPayload } from "./plot3d.chip.js";
import { INSERT_PLOT3D_COMMAND } from "./plot3d.node";
import TeX from "@matejmazur/react-katex";
import app from "../../ui/styles/App.module.scss";
import { LexicalEditor } from "lexical";

interface DialogProps {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}

export function Plot3DPrompt({ activeEditor, onClose }: DialogProps) {
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
    <div className={app.plot3d_shell}>
      <TextInput
        label={<TeX math={"z(x,y) = "} />}
        onChange={setZ}
        value={z}
        placeholder={"Enter an expression of variables x and y."}
      />
      <Interval
        label={<TeX math={"x\\text{-domain}"} />}
        value={xDomain}
        onChange={setXDomain}
        minLabel={<TeX math={"x_0"} />}
        maxLabel={<TeX math={"x_1"} />}
      />
      <Interval
        label={<TeX math={"y\\text{-domain}"} />}
        value={yDomain}
        onChange={setYDomain}
        minLabel={<TeX math={"y_0"} />}
        maxLabel={<TeX math={"y_1"} />}
      />
      <div className={app.plot3d_footer}>
        <button onClick={save} className={app.modal_save}>save</button>
      </div>
      <Detail summary={"Advanced"} bodyClass={app.advanced}>
        <Row>
          <label>Scale</label>
          <NumberInput onChange={setScale} value={scale} />
        </Row>
        <Row>
          <label className={app.camera_label}>Camera</label>
          <Row>
            <NumberInput onChange={setPosX} value={posX} />
            <NumberInput onChange={setPosY} value={posY} />
            <NumberInput onChange={setPosZ} value={posZ} />
          </Row>
        </Row>
        <Row>
          <label>Width</label>
          <NumberInput onChange={setWidth} value={width} />
        </Row>
        <Row>
          <label>Height</label>
          <NumberInput onChange={setHeight} value={height} />
        </Row>
        <Row>
          <label>Segments</label>
          <NumberInput onChange={setSegments} value={segments} />
        </Row>
        <Row>
          <label>FOV</label>
          <NumberInput onChange={setFov} value={fov} />
        </Row>
        <Row>
          <label>Near</label>
          <NumberInput onChange={setNear} value={near} />
        </Row>
        <Row>
          <label>Far</label>
          <NumberInput onChange={setFar} value={far} />
        </Row>
      </Detail>
    </div>
  );
}
