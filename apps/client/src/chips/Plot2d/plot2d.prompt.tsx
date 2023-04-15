import { Children, EditorPrompt } from "src/util";
import app from "../../ui/styles/App.module.scss";
import { useModal } from "@hooks/useModal";
import {
  Button,
  Card,
  Field,
  Form,
  Interval,
  NumberInput,
  Optional,
  OptionsList,
  Palette,
  TextInput,
} from "../Inputs";
import { Fragment, useState } from "react";
import {
  BasePlotFn,
  IntegralData,
  PlotFn,
  RiemannDatum,
  RiemannMethod,
} from "./plot2d.chip";
import { INSERT_PLOT_2D_COMMAND } from "./plot2d.node";
type BasePlotUpdate = (d: Partial<BasePlotFn>) => void;

type RiemannUpdate = (d: Partial<RiemannDatum>) => void;
const defaultPayload: PlotFn = {
  fn: "",
  id: "demo",
  domain: [-10, 10],
  range: [-10, 10],
  samples: 170,
  color: "#ff0000",
  riemann: {
    domain: [NaN, NaN],
    dx: 0.5,
    method: "left",
    color: "#ff0000",
  },
  integrate: {
    bounds: [NaN, NaN],
    color: "#ff0000",
  },
};
type IntegralUpdate = (d: Partial<IntegralData>) => void;

export default function Plot2DPrompt({
  activeEditor,
  onClose,
}: EditorPrompt) {
  const [entries, setEntries] = useState<PlotFn[]>([]);
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [ticks, setTicks] = useState(10);
  const [samples, setSamples] = useState(170);

  const updateBasePlot = (index: number) => {
    return (payload: Partial<BasePlotFn>) => {
      const entry = entries[index];
      if (entry === undefined) return;
      const clone = { ...entry };
      const update = { ...clone, ...payload };
      setEntries(entries.map((E, i) => (
        i === index ? update : E
      )));
    };
  };

  const updateRiemann = (index: number) => {
    return (payload: Partial<RiemannDatum>) => {
      const entry = entries[index];
      if (entry === undefined) return;
      const prev = entry.riemann;
      if (prev === undefined) return;
      const clone = { ...entry };
      const update = { ...prev, ...payload };
      clone.riemann = update;
      setEntries(entries.map((E, i) => (
        i === index ? clone : E
      )));
    };
  };

  const updateIntegral = (index: number) => {
    return (payload: Partial<IntegralData>) => {
      const entry = entries[index];
      if (entry === undefined) return;
      const prev = entry.integrate;
      if (prev === undefined) return;
      const clone = { ...entry };
      const update = { ...prev, ...payload };
      clone.integrate = update;
      setEntries(entries.map((E, i) => (
        i === index ? clone : E
      )));
    };
  };

  const onDelete = (index: number) =>
    setEntries(
      entries.filter((E, i) => i !== index),
    );

  const onPush = () =>
    setEntries(
      (prev) => [...prev, defaultPayload],
    );

  const save = () => {
    const L = entries.length;
    const functions: PlotFn[] = [];
    for (let i = 0; i < L; i++) {
      const fn = entries[i];
      if (fn.fn === "") continue;
      if (domain[0] >= domain[1]) continue;
      if (fn.range[0] >= fn.domain[1]) continue;
      if (fn.samples <= 0 || 600 <= fn.samples) continue;
      functions.push(fn);
    }
    if (functions.length < 0) {
      return onClose();
    }
    activeEditor.dispatchCommand(INSERT_PLOT_2D_COMMAND, {
      functions,
      domain,
      range,
      width: 500,
      height: 500,
      ticks,
      samples,
    });
    onClose();
  };

  return (
    <Form
      onSave={save}
      headers={() => (
        <Fragment>
          <Field name={"Domain"}>
            <Interval
              allowFloats={[true, true]}
              val={domain}
              act={setDomain}
            />
          </Field>
          <Field name={"Range"}>
            <Interval
              allowFloats={[true, true]}
              val={range}
              act={setRange}
            />
          </Field>
          <Field name={"Samples"}>
            <NumberInput val={samples} act={setSamples} />
          </Field>
          <Field name={"Ticks"}>
            <NumberInput val={ticks} act={setTicks} />
          </Field>
        </Fragment>
      )}
      footers={() => (
        <Button
          click={onPush}
          label={"New Function"}
          className={app.longbutton}
        />
      )}
    >
      {entries.map((E, i) => (
        <Card
          key={E.id + i}
          onDelete={() => onDelete(i)}
        >
          <FunctionForm
            fn={E.fn}
            domain={E.domain}
            range={E.range}
            samples={E.samples}
            curveColor={E.color}
            update={updateBasePlot(i)}
            temp={i === 0 ? "E.g., f(x) = x^2" : ""}
          />
          <IntegralForm
            integralColor={E.integrate ? E.integrate.color : "#000"}
            integral={E.integrate ? E.integrate.bounds : [NaN, NaN]}
            update={updateIntegral(i)}
          />
          <RiemannForm
            update={updateRiemann(i)}
            method={E.riemann ? E.riemann.method : "left"}
            dx={E.riemann ? E.riemann.dx : 0.1}
            rDomain={E.riemann ? E.riemann.domain : [NaN, NaN]}
            rectColor={E.riemann ? E.riemann.color : "#000"}
          />
        </Card>
      ))}
    </Form>
  );
}

type pBaseEntry = {
  fn: string;
  domain: [number, number];
  range: [number, number];
  samples: number;
  curveColor: string;
  update: BasePlotUpdate;
  temp: string;
};

function FunctionForm(props: pBaseEntry) {
  return (
    <Fragment>
      <Field name={"Function"}>
        <TextInput 
					val={props.fn} 
					temp={props.temp}
					act={(fn) => props.update({ fn })}
				/>
      </Field>
      <Field name={"Domain"}>
        <Interval
          val={props.domain}
          act={(domain) => props.update({ domain })}
          allowFloats={[true, true]}
        />
      </Field>
      <Field name={"Range"}>
        <Interval
          val={props.range}
          act={(range) => props.update({ range })}
          allowFloats={[true, true]}
        />
      </Field>
      <Field name={"Curve color"}>
        <Palette
          init={props.curveColor}
          act={(color) => props.update({ color })}
        />
      </Field>
    </Fragment>
  );
}
type pRiemannForm = {
  rectColor: string;
  rDomain: [number, number];
  dx: number;
  method: RiemannMethod;
  update: RiemannUpdate;
};

function RiemannForm(props: pRiemannForm) {
  const update = (x: boolean) =>
    props.update({
      domain: x ? [-3, 3] : [NaN, NaN],
    });
  return (
    <Fragment>
      <Optional
        act={update}
        val={!(isNaN(props.rDomain[0]) && isNaN(props.rDomain[1]))}
        label={"Riemann Sums"}
      >
        <Field name={"Interval"}>
          <Interval
            val={props.rDomain}
            act={(domain) => props.update({ domain })}
            allowFloats={[true, true]}
          />
        </Field>
        <Field name={"Method"}>
          <OptionsList
            options={["left", "midpoint", "right"]}
            val={props.method}
            act={(method) => props.update({ method })}
          />
        </Field>
        <Field name={"Rectangle Color"}>
          <Palette
            act={(color) => props.update({ color })}
            init={props.rectColor}
          />
        </Field>
      </Optional>
    </Fragment>
  );
}

type pIntegralForm = {
  integral: [number, number];
  integralColor: string;
  update: IntegralUpdate;
};

function IntegralForm(props: pIntegralForm) {
  const update = (x: boolean) =>
    props.update({
      bounds: x ? [-3, 3] : [NaN, NaN],
    });
  return (
    <Optional
      val={!(isNaN(props.integral[0]) && isNaN(props.integral[1]))}
      act={update}
      label={"Integrate"}
    >
      <Field name={"Interval"}>
        <Interval
          val={props.integral}
          act={(bounds) => props.update({ bounds })}
        />
      </Field>
      <Field name={"Area Color"}>
        <Palette
          act={(color) => props.update({ color })}
          init={props.integralColor}
        />
      </Field>
    </Optional>
  );
}
