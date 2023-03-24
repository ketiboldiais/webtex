import TeX from "@matejmazur/react-katex";
import { Interval } from "./Interval.js";
import { Plot3d } from "./Plot2.js";
import { useCallback, useState } from "react";

export function Plotter3D() {
  const [fn, setFn] = useState("");
  const [plotFn, setPlotFn] = useState("");
  const [domain, setDomain] = useState<[number, number]>([-10, 10]);
  const [range, setRange] = useState<[number, number]>([-10, 10]);
  const [showPanel, setShowPanel] = useState(true);
  const updateFn = useCallback(() => {
    setPlotFn(fn);
  }, [fn]);
  return (
    <div>
      <div
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
      >
        {(showPanel || fn === "") && (
          <div>
            <section>
              <TeX math={"z(x,y) = ~"} />
              <input
                type={"text"}
                value={fn}
                onChange={(ev) => setFn(ev.target.value)}
              />
            </section>
            <Interval
              label={"x-interval"}
              value={domain}
              onChange={setDomain}
              minLabel={"x₀"}
              maxLabel={"x₁"}
            />
            <Interval
              label={"y-interval"}
              value={range}
              onChange={setRange}
              minLabel={"y₀"}
              maxLabel={"y₁"}
            />
            <button onClick={updateFn}>
              Render
            </button>
          </div>
        )}
      </div>
      <div>
        {plotFn && (
          <Plot3d
            key={"xyz_plotter"}
            z={plotFn}
          />
        )}
      </div>
    </div>
  );
}
