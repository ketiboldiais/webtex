import { Interval } from "Interval";
import { PlotParametric } from "components/chips/Plot2";
import { algom } from "mathlang";
import { useCallback, useEffect, useState } from "react";
import TeX from "@matejmazur/react-katex";

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
    setXTex(algom.toLatex(xt));
  }, [xt]);

  useEffect(() => {
    setYTex(algom.toLatex(yt));
  }, [yt]);

  const updateFn = useCallback(() => {
    setFns([xt, yt]);
  }, [xt, yt]);

  return (
    <div>
      <div
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
      >
        {(showPanel || (xt === "") || (yt === "")) && (
          <div>
            <section>
              <TeX math={"x(t) = ~"} />
              <input
                type={"text"}
                value={xt}
                onChange={(ev) => setXt(ev.target.value)}
              />
            </section>
            <section>
              <TeX math={"y(t) = ~"} />
              <input
                type={"text"}
                value={yt}
                onChange={(ev) => setYt(ev.target.value)}
              />
            </section>
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
            <button onClick={updateFn}>
              Render
            </button>
          </div>
        )}
      </div>
      <div>
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
