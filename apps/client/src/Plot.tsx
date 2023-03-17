import S from "@styles/App.module.css";
import TeX from "@matejmazur/react-katex";
import ParametricSVG from "./icons/parametric.svg";
import XyzSVG from "./icons/xyz.svg";
import XYSVG from "./icons/xy.svg";
import PolarSVG from "./icons/polar.svg";
import CalcSVG from "./icons/calculate.svg";
import SheetSVG from "./icons/sheet.svg";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "./App";
import { algom } from "./mathlang";
import { Plot3d, PlotParametric, PlotXY } from "@components/chips/Plot2";
import { Sheet } from "./Sheet";
import {Table } from "./DataTable";

function SheetIcon() {
  return (
    <>
      <img src={SheetSVG} />
      <label>Spreadsheet</label>
    </>
  );
}

function CalcIcon() {
  return (
    <>
      <img src={CalcSVG} />
      <label>Arithmetic</label>
    </>
  );
}
function PolarIcon() {
  return (
    <>
      <img src={PolarSVG} />
      <label>Polar Plot</label>
    </>
  );
}

function XYIcon() {
  return (
    <>
      <img src={XYSVG} />
      <label>2D Plot</label>
    </>
  );
}

function XYZIcon() {
  return (
    <>
      <img src={XyzSVG} />
      <label>3D Plot</label>
    </>
  );
}

function ParIcon() {
  return (
    <>
      <img src={ParametricSVG} />
      <label>Parametric Plot</label>
    </>
  );
}

interface CounterProps {
  onDecrement: (n: number) => number;
  onIncrement: (n: number) => number;
  initialValue: number;
  label?: string | ReactNode;
}

function Counter(
  {
    onDecrement,
    onIncrement,
    initialValue,
    label,
  }: CounterProps,
) {
  const [value, setValue] = useState(initialValue);
  const decrement = () => setValue(onDecrement(value));
  const increment = () => setValue(onIncrement(value));
  return (
    <div className={S.NumberInput}>
      <div className={S.Body}>
        <button className={S.OpButton} onClick={decrement}>{"-"}</button>
        <input
          className={S.NumField}
          type={"number"}
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber)}
        />
        <button className={S.OpButton} onClick={increment}>{"+"}</button>
      </div>
      {label && <div className={S.NumInputLabel}>{label}</div>}
    </div>
  );
}

interface MinMaxProps {
  label: string | ReactNode;
  className?: string;
  labelClassName?: string;
  fieldClassName?: string;
  value: [number, number];
  minLabel?: string | ReactNode;
  maxLabel?: string | ReactNode;
  onChange: (interval: [number, number]) => void;
}
export function MinMax(
  {
    label,
    fieldClassName = S.MinMaxInput,
    className = S.PlotInputOption,
    labelClassName = S.MinMaxLabel,
    onChange,
    value,
    minLabel,
    maxLabel,
  }: MinMaxProps,
) {
  const [interval, updateInterval] = useState(value);

  const minDecrement = () => {
    const [min, max] = interval;
    onChange([min - 1, max]);
    updateInterval([min - 1, max]);
    return min - 1;
  };

  const minIncrement = () => {
    const [min, max] = interval;
    if (min < max - 1) {
      onChange([min + 1, max]);
      updateInterval([min + 1, max]);
      return min + 1;
    }
    return min;
  };

  const maxIncrement = () => {
    const [min, max] = interval;
    onChange([min, max + 1]);
    updateInterval([min, max + 1]);
    return max + 1;
  };

  const maxDecrement = () => {
    const [min, max] = interval;
    if (max > min + 1) {
      onChange([min, max - 1]);
      updateInterval([min, max - 1]);
      return max - 1;
    }
    return max;
  };

  return (
    <div className={className}>
      <div className={labelClassName}>{label}</div>
      <div className={fieldClassName}>
        <Counter
          onDecrement={minDecrement}
          onIncrement={minIncrement}
          initialValue={value[0]}
          label={minLabel}
        />
        <Counter
          onDecrement={maxDecrement}
          onIncrement={maxIncrement}
          initialValue={value[1]}
          label={maxLabel}
        />
      </div>
    </div>
  );
}

export function ParametricPlotter() {
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [showPanel, setShowPanel] = useState(true);
  const [xt, setXt] = useState("");
  const [yt, setYt] = useState("");
  const [fns, setFns] = useState(["", ""]);
  const [xtTex, setXTex] = useState("");
  const [ytTex, setYTex] = useState("");

  useEffect(() => {
    setXTex(algom.toLatex(xt).latex);
  }, [xt]);

  useEffect(() => {
    setYTex(algom.toLatex(yt).latex);
  }, [yt]);

  const updateFn = useCallback(() => {
    setFns([xt, yt]);
  }, [xt, yt]);

  return (
    <div className={S.PlotWindow}>
      <div
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
        className={S.PlotPanel}
      >
        {(showPanel || (xt === "") || (yt === "")) && (
          <div className={S.PlotInputPanel}>
            <section className={S.Prompt}>
              <TeX math={"x(t) = ~"} className={S.Label} />
              <input
                className={S.FunctionInput}
                type={"text"}
                value={xt}
                onChange={(ev) =>
                  setXt(ev.target.value)}
              />
            </section>
            <section className={S.Prompt}>
              <TeX math={"y(t) = ~"} className={S.Label} />
              <input
                className={S.FunctionInput}
                type={"text"}
                value={yt}
                onChange={(ev) => setYt(ev.target.value)}
              />
            </section>
            <MinMax
              label={"Domain"}
              value={domain}
              onChange={setDomain}
              minLabel={"x₀"}
              maxLabel={"x₁"}
            />
            <MinMax
              label={"Range"}
              value={range}
              onChange={setRange}
              minLabel={"y₀"}
              maxLabel={"y₁"}
            />
            <button
              className={S.AddPlotButton}
              onClick={updateFn}
            >
              Render
            </button>
            <div className={S.LiveTex}>
              <TeX math={xtTex} errorColor="lightgrey" />
            </div>
            <div className={S.LiveTex}>
              <TeX math={ytTex} errorColor="lightgrey" />
            </div>
          </div>
        )}
      </div>
      <div className={S.PlotRenderer}>
        {fns[0] && fns[1] && (
          <PlotParametric
            fx={fns[0]}
            fy={fns[1]}
            domain={domain}
            range={range}
          />
        )}
      </div>
    </div>
  );
}

export function Plotter3D() {
  const [fn, setFn] = useState("");
  const [plotFn, setPlotFn] = useState("");
  const [tex, setTex] = useState("");
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [showPanel, setShowPanel] = useState(true);
  useEffect(() => {
    setTex(algom.toLatex(fn).latex);
  }, [fn]);
  const updateFn = useCallback(() => {
    setPlotFn(fn);
  }, [fn]);
  return (
    <div className={S.PlotWindow}>
      <div
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
        className={S.PlotPanel}
      >
        {(showPanel || fn === "") && (
          <div className={S.PlotInputPanel}>
            <section className={S.Prompt}>
              <TeX math={"z(x,y) = ~"} className={S.Label} />
              <input
                className={S.FunctionInput}
                type={"text"}
                value={fn}
                onChange={(ev) => setFn(ev.target.value)}
              />
            </section>
            <MinMax
              label={"x-interval"}
              className={S.PlotInputOption}
              labelClassName={S.MinMaxLabel}
              fieldClassName={S.MinMaxInput}
              value={domain}
              onChange={setDomain}
              minLabel={"x₀"}
              maxLabel={"x₁"}
            />
            <MinMax
              label={"y-interval"}
              className={S.PlotInputOption}
              labelClassName={S.MinMaxLabel}
              fieldClassName={S.MinMaxInput}
              value={range}
              onChange={setRange}
              minLabel={"y₀"}
              maxLabel={"y₁"}
            />
            <button className={S.AddPlotButton} onClick={updateFn}>
              Render
            </button>
            <div className={S.LiveTex}>
              <TeX math={tex} errorColor="lightgrey" />
            </div>
          </div>
        )}
      </div>
      <div className={S.PlotRenderer}>
        {plotFn && (
          <Plot3d
            key={"xyz_plotter"}
            z={plotFn}
            // z={(x: number, y: number) => Math.sin(Math.sqrt(x ** 2 + y ** 2))}
          />
        )}
      </div>
    </div>
  );
}

export function XyPlotter() {
  const [fn, setFn] = useState("");
  const [plotFn, setPlotFn] = useState("");
  const [tex, setTex] = useState("");
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [showPanel, setShowPanel] = useState(true);
  useEffect(() => {
    setTex(algom.toLatex(fn).latex);
  }, [fn]);
  const updateFn = useCallback(() => {
    setPlotFn(fn);
  }, [fn]);
  return (
    <div className={S.PlotWindow}>
      <div
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
        className={S.PlotPanel}
      >
        {(showPanel || fn === "") && (
          <div className={S.PlotInputPanel}>
            <section className={S.Prompt}>
              <TeX math={"f(x) = ~"} className={S.Label} />
              <input
                className={S.FunctionInput}
                type={"text"}
                value={fn}
                onChange={(ev) => setFn(ev.target.value)}
              />
            </section>
            <MinMax
              label={"Domain"}
              value={domain}
              onChange={setDomain}
              minLabel={"x₀"}
              maxLabel={"x₁"}
            />
            <MinMax
              label={"Range"}
              value={range}
              onChange={setRange}
              minLabel={"y₀"}
              maxLabel={"y₁"}
            />
            <button
              className={S.AddPlotButton}
              onClick={updateFn}
            >
              Render
            </button>
            <div className={S.LiveTex}>
              <TeX math={tex} errorColor="lightgrey" />
            </div>
          </div>
        )}
      </div>
      <div className={S.PlotRenderer}>
        {plotFn && <PlotXY f={plotFn} domain={domain} range={range} />}
      </div>
    </div>
  );
}

import { ast, ASTNode } from "./mathlang/nodes/index.js";
export function Calculator() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("");
  const [tree, setTree] = useState<ASTNode>(ast.nil);

  const updateExpr = (v: string) => {
    const newexpr = expr + v;
    setExpr(newexpr);
    const res = algom.toLatex(newexpr);
    setDisplay(res.latex);
    setTree(res.result);
  };

  const clearExpr = () => {
    setExpr("");
    setDisplay("");
    setTree(ast.nil);
  };

  const evalExpr = () => {
    const newexpr = algom.evalNode(tree);
    setExpr(newexpr);
    setDisplay(newexpr);
  };

  return (
    <div className={S.Calculator}>
      <TeX
        math={display}
        className={S.Screen}
      />
      <div className={S.Keyboard}>
        <section className={S.NumberPad}>
          <div className={S.Row}>
            <button onClick={() => updateExpr("1")}>{"1"}</button>
            <button onClick={() => updateExpr("2")}>{"2"}</button>
            <button onClick={() => updateExpr("3")}>{"3"}</button>
            <button onClick={() => updateExpr(" + ")}>{"+"}</button>
          </div>
          <div className={S.Row}>
            <button onClick={() => updateExpr("4")}>{"4"}</button>
            <button onClick={() => updateExpr("5")}>{"5"}</button>
            <button onClick={() => updateExpr("6")}>{"6"}</button>
            <button onClick={() => updateExpr(" - ")}>{"-"}</button>
          </div>
          <div className={S.Row}>
            <button onClick={() => updateExpr("7")}>{"7"}</button>
            <button onClick={() => updateExpr("8")}>{"8"}</button>
            <button onClick={() => updateExpr("9")}>{"9"}</button>
            <button onClick={() => updateExpr(" / ")}>{"/"}</button>
          </div>
          <div className={S.Row}>
            <button onClick={() => updateExpr(".")}>{"."}</button>
            <button onClick={() => updateExpr("0")}>{"0"}</button>
            <button onClick={() => evalExpr()}>{"="}</button>
            <button onClick={() => updateExpr(" * ")}>{"×"}</button>
          </div>
        </section>
        <section className={S.Trig}>
          <button onClick={() => updateExpr("cos(")}>{"cos"}</button>
          <button onClick={() => updateExpr("tan(")}>{"tan"}</button>
          <button onClick={() => updateExpr("acos(")}>{"acos"}</button>
          <button onClick={() => updateExpr("acosh(")}>{"acosh"}</button>
          <button onClick={() => updateExpr("abs(")}>{"abs"}</button>
          <button onClick={() => updateExpr("sqrt(")}>
            <TeX math={"\\sqrt{x}"} />
          </button>
        </section>
        <section className={S.Clear}>
          <button onClick={() => clearExpr()}>CLEAR</button>
        </section>
      </div>
    </div>
  );
}

export function Plotter() {
  const [active, setActive] = useState(0);
  const components = [
    <XyPlotter key={"xy_plotter"} />,
    <ParametricPlotter key={"parameteric_plotter"} />,
    <Plotter3D key={"xyz_plotter"} />,
    <Calculator key={"plotter_calculator"} />,
    <Sheet key={"spreadsheet"} />,
    // <PolarPlot key={"polar_plotter"} f={(x: number) => Math.sin(2 * x) * Math.cos(2 * x)} />,
  ];
  return (
    <div className={S.Plotter}>
      <div className={S.PlotControl}>
        <Button click={() => setActive(0)} label={<XYIcon />} />
        <Button click={() => setActive(1)} label={<ParIcon />} />
        <Button click={() => setActive(2)} label={<XYZIcon />} />
        <Button click={() => setActive(3)} label={<CalcIcon />} />
        <Button click={() => setActive(4)} label={<SheetIcon />} />
        {/* <Button click={() => setActive(4)} label={<PolarIcon />} /> */}
      </div>
      <div className={S.PlotOutput}>
        {/* {components.map((element, index) => (index === active && element))} */}
        {/* <Sheet key={"spreadsheet"} /> */}
        <Table />
      </div>
    </div>
  );
}
