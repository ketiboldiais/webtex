import plot from "./assets/styles/Plot.module.scss";
import TeX from "@matejmazur/react-katex";
import { Interval } from "./Interval";
import { useCallback, useState } from "react";
import { algom } from "./algom/index.js";
import { Plot1 } from "./components/chips/Plot2";
import { Table } from "./DataTable";
import { nanoid } from "@reduxjs/toolkit";
import { Plot1Payload } from "./components/chips/Plot2";
import { Render } from "./utils";

export function XyPlotter() {
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [showPanel, setShowPanel] = useState(true);
  const [render, setRender] = useState(false);
  const [data, setData] = useState<Plot1Payload[]>([{
    variable: "x",
    expression: "x^2",
  }]);

  const updatePlot = useCallback(() => {
    setRender(true);
  }, [data.length]);
  const toggleControl = () => setShowPanel(!showPanel);
  const uid = nanoid(8);

  return (
    <div className={plot.plot}>
      <div>
        <div className={plot.windowNav}>
          <button onClick={toggleControl}>
            {showPanel ? <>&times;</> : <>{"_"}</>}
          </button>
        </div>
        <div className={showPanel ? plot.show : plot.hide}>
          <div className={plot.controller}>
            <Table
              data={data}
              onUpdate={setData}
              uid={uid}
              keys={["variable", "expression"]}
              cell={(v) => <TeX math={algom.toLatex(v)} />}
              schema={{
                variable: { label: "Var" },
                expression: { label: "Expression" },
              }}
            />
            <Interval
              label={"Domain"}
              value={domain}
              onChange={setDomain}
              minLabel={"x₀"}
              maxLabel={"x₁"}
            />
            <Interval
              label={"Range"}
              value={range}
              onChange={setRange}
              minLabel={"y₀"}
              maxLabel={"y₁"}
            />
            <div className={plot.renderRow}>
              <button
                onClick={updatePlot}
              >
                Render
              </button>
            </div>
          </div>
        </div>
      </div>
      <figure className={plot.svg}>
        {Render(<Plot1 fs={data} domain={domain} range={range} />).OnlyIf(
          render,
        )}
      </figure>
    </div>
  );
}
