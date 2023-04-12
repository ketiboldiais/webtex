import { nanoid } from "nanoid";
import { useState } from "react";
import { toLatex } from "@webtex/algom";
import { Pair } from "src/App";
import { concat } from "src/util";
import { Table } from "../DataTable";
import { Detail } from "../Detail";
import { NumberInput, Row } from "../Inputs";
import { Interval } from "../Interval";
import { INSERT_PARAMETRIC_PLOT_COMMAND } from "./parametric.node";
import { Parametric_Function_Payload } from "./parametric.chip";
import TeX from "@matejmazur/react-katex";
import app from "../../ui/styles/App.module.scss";
import { LexicalEditor } from "lexical";

interface IPPD {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}
export function ParametricPlotPrompt({ activeEditor, onClose }: IPPD) {
  const [functions, setFunctions] = useState<Parametric_Function_Payload[]>([]);
  const [domain, setDomain] = useState<Pair<number>>([-10, 10]);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [ticks, setTicks] = useState(10);

  const save = () => {
    activeEditor.dispatchCommand(INSERT_PARAMETRIC_PLOT_COMMAND, {
      functions,
      ticks,
      domain,
      width,
      height,
    });
    onClose();
  };

  return (
    <div className={app.parametric_shell}>
      <Table
        data={functions}
        onUpdate={setFunctions}
        uid={concat("ParametricPlotV1", nanoid(5))}
        keys={["x_of_t", "y_of_t"]}
        cell={(c, k) => (
          <TeX
            math={(k === "x_of_t" ? "x(t)" : "y(t)") + "=" + toLatex(c)}
          />
        )}
        schema={{
          x_of_t: { label: <TeX math={"x(t)"} />, placeholder: "x(t)" },
          y_of_t: { label: <TeX math={"y(t)"} />, placeholder: "y(t)" },
        }}
      />
      <Interval
        label={<TeX math={"t\\text{-domain}"} />}
        value={domain}
        onChange={setDomain}
        minLabel={<TeX math={"t_0"} />}
        maxLabel={<TeX math={"t_1"} />}
      />
      <div className={app.parametric_footer}>
        <button onClick={save} className={app.modal_save}>
          Save
        </button>
      </div>
      <Detail summary={"Advanced"} bodyClass={app.advanced}>
        <Row>
          <label>Width</label>
          <NumberInput onChange={setWidth} value={width} />
        </Row>
        <Row>
          <label>Height</label>
          <NumberInput onChange={setHeight} value={height} />
        </Row>
        <Row>
          <label>Ticks</label>
          <NumberInput onChange={setTicks} value={ticks} />
        </Row>
      </Detail>
    </div>
  );
}
