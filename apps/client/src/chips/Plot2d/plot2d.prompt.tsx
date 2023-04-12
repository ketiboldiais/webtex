import { nanoid } from "nanoid";
import { useState } from "react";
import { toLatex } from "@webtex/algom";
import { Pair } from "src/App";
import { Table } from "../DataTable";
import { Interval } from "../Interval";
import { FuncExprPayload } from "./plot2d.chip";
import TeX from "@matejmazur/react-katex";
import app from "../../ui/styles/App.module.scss";
import { LexicalEditor } from "lexical";
import { INSERT_PLOT_COMMAND } from "./plot2d.node";

interface InsertPlotProps {
  activeEditor: LexicalEditor;
  onClose: VoidFunction;
}

export function PlotPrompt({ activeEditor, onClose }: InsertPlotProps) {
  const [domain, setDomain] = useState<Pair<number>>([-10, 10]);
  const [range, setRange] = useState<Pair<number>>([-10, 10]);
  const [data, setData] = useState<FuncExprPayload[]>([]);
  const save = () => {
    activeEditor.dispatchCommand(INSERT_PLOT_COMMAND, {
      functions: data,
      ticks: 10,
      domain,
      range,
    });
    onClose();
  };
  return (
    <div>
      <Table
        data={data}
        onUpdate={setData}
        uid={nanoid(7)}
        keys={["variable", "expression"]}
        cell={(c) => <TeX math={toLatex(c)} />}
        schema={{
          variable: { label: "Variable" },
          expression: { label: "Expression" },
        }}
      />
      <Interval
        label={"Domain"}
        value={domain}
        onChange={setDomain}
        minLabel={<TeX math={"x_0"} />}
        maxLabel={<TeX math={"x_1"} />}
      />
      <Interval
        label={"Range"}
        value={range}
        onChange={setRange}
        minLabel={<TeX math={"y_0"} />}
        maxLabel={<TeX math={"y_1"} />}
      />
      <button className={app.modal_save} onClick={save}>Save</button>
    </div>
  );
}
