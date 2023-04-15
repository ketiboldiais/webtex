import app from "../../ui/styles/App.module.scss";
import { useState } from "react";
import { EditorPrompt } from "src/util";
import {
  Card,
  Field,
  Form,
  Interval,
  NumberInput,
  Palette,
  Range,
  TextInput,
} from "../Inputs";
import { INSERT_PLOT3D_COMMAND } from "./plot3d.node";

export function Plot3DPrompt({
  activeEditor,
  onClose,
}: EditorPrompt) {
  const [z_expression, setZExpr] = useState("");
  const [segments, setSegments] = useState(100);
  const [fov, setFOV] = useState(60);
  const [position, setPosition] = useState<number[]>([12, 5, 12]);
  const [near, setNear] = useState(0.1);
  const [far, setFar] = useState(30);
  const [xDomain, setXDomain] = useState<[number, number]>([-10, 10]);
  const [yDomain, setYDomain] = useState<[number, number]>([-10, 10]);
  const [scale, setScale] = useState(0.3);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const [gridColor, setGridColor] = useState("#d3d3d3");

  const save = () => {
    const xMin = xDomain[0];
    const xMax = xDomain[1];
    const yMin = yDomain[0];
    const yMax = yDomain[1];
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    activeEditor.dispatchCommand(INSERT_PLOT3D_COMMAND, {
      z_expression,
      segments,
      fov,
      position: position as [number, number, number],
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
    onClose();
  };

  return (
    <Form className={app.fullform} onSave={save}>
      <Card>
        <Field name={"z-function"}>
          <TextInput
            val={z_expression}
            act={setZExpr}
            temp={"E.g., z(x,y) = sin(x^2 + y^2)"}
          />
        </Field>
        <Field name={"x-domain"}>
          <Interval val={xDomain} act={setXDomain} />
        </Field>
        <Field name={"y-domain"}>
          <Interval val={yDomain} act={setYDomain} />
        </Field>
        <Field name={"Scale"}>
          <Range val={scale} min={0.1} max={1} act={setScale} />
        </Field>
        <Field name={"Canvas Width"}>
          <NumberInput
            val={width}
            min={100}
            max={500}
            act={setWidth}
            nonnegative={true}
            allowFloat={false}
          />
        </Field>
        <Field name={"Canvas Height"}>
          <NumberInput
            val={height}
            min={100}
            max={500}
            act={setHeight}
            nonnegative={true}
            allowFloat={false}
          />
        </Field>
        <Field name={"Segments"}>
          <NumberInput
            allowFloat={false}
            nonnegative={true}
            val={segments}
            act={setSegments}
          />
        </Field>
        <Field name={"Field of View"}>
          <NumberInput
            allowFloat={false}
            val={fov}
            act={setFOV}
          />
        </Field>
        <Field name={"Near"}>
          <Range val={near} min={0.1} max={1} act={setNear} />
        </Field>
        <Field name={"Far"}>
          <Range val={far} min={1} max={40} act={setFar} />
        </Field>
        <Field name={"Camera Position (x,y,z)"}>
          <section>
            <NumberInput
              allowFloat={false}
              val={position[0]}
              act={(x) =>
                setPosition(position.map((n, i) => (i === 0 ? x : n)))}
            />
            <NumberInput
              allowFloat={false}
              val={position[1]}
              act={(y) =>
                setPosition(position.map((n, i) => (i === 1 ? y : n)))}
            />
            <NumberInput
              allowFloat={false}
              val={position[2]}
              act={(z) =>
                setPosition(position.map((n, i) => (i === 1 ? z : n)))}
            />
          </section>
        </Field>
        <Field name={"Grid color"}>
          <Palette init={gridColor} act={setGridColor} />
        </Field>
      </Card>
    </Form>
  );
}
