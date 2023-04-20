import { CSSProperties, Fragment, useState } from "react";
import { _Button, Button } from "./button.input";
import { _TextInput, TextInput } from "./text.input";
import { _Interval, IntervalInput } from "./interval.input";
import { _NumberInput, NumberInput } from "./number.input";
import { _Range, Range } from "./range.input";

type IO<t> = { type: t };

type _Schema = {
  text: (args: _TextInput) => _TextInput & IO<"text">;
  interval: (args: _Interval) => _Interval & IO<"interval">;
  number: (args: _NumberInput) => _NumberInput & IO<"number">;
  range: (args: _Range) => _Range & IO<"range">;
};

type RT<x extends (...args: any) => any> = ReturnType<x>;

type INPUT =
  | RT<_Schema["text"]>
  | RT<_Schema["interval"]>
  | RT<_Schema["range"]>
  | RT<_Schema["number"]>;

type _Form = {
  body: (schema: _Schema) => [string, INPUT][];
};

function IO({ input }: { input: INPUT }) {
  switch (input.type) {
    case "text":
      return <TextInput {...input} />;
    case "interval":
      return <IntervalInput {...input} />;
    case "number":
      return <NumberInput {...input} />;
    case "range":
      return <Range {...input} />;
    default:
      return <></>;
  }
}
export function Form({ body }: _Form) {
  const res = body({
    text: (args) => ({ ...args, type: "text" }),
    interval: (args) => ({ ...args, type: "interval" }),
    number: (args) => ({ ...args, type: "number" }),
    range: (args) => ({ ...args, type: "range" }),
  });
  const style: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 4fr",
		margin: '10px'
  };
  return (
    <div>
      {res.map(([label, input], i) => (
        <section key={input.type + i} style={style}>
          <label>{label}</label>
          <div style={{width: 'fit-content'}}>
            <IO input={input} />
          </div>
        </section>
      ))}
    </div>
  );
}

type N2 = [number, number];
export const Plot2DMenu = () => {
  const [val, setVal] = useState("");
  const [domain, setDomain] = useState<N2>([-10, 10]);
  const [range, setRange] = useState<N2>([-10, 10]);
  const [ticks, setTicks] = useState(10);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  return (
    <Form
      body={(io) => [
        ["Function", io.text({ val, act: setVal })],
        ["Domain", io.interval({ val: domain, act: setDomain })],
        ["Range", io.interval({ val: range, act: setRange })],
        ["Ticks", io.number({ val: ticks, act: setTicks })],
        ["Width", io.range({ val: width, act: setWidth, min: 100, max: 700 })],
        [
          "Height",
          io.range({ val: height, act: setHeight, min: 100, max: 700 }),
        ],
      ]}
    />
  );
};
