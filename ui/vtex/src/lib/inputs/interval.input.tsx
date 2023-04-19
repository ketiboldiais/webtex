import { useState } from "react";
import { NumberInput } from "./number.input";

export type _Interval = {
  val: [number, number];
  act: (interval: [number, number]) => void;
  real?: [boolean, boolean];
  mainClass?: string;
  inputClass?: string;
  minusClass?: string;
  addClass?: string;
  steps?: [number, number];
};

export function IntervalInput({
  val,
  act,
  real = [false, false],
  mainClass = "",
  inputClass = "",
  minusClass = "",
  addClass = "",
  steps = [real[0] ? 0.001 : 1, real[1] ? 0.001 : 1],
}: _Interval) {
  const [interval, setInterval] = useState(val);

  const updateMin = (newMin: number) => {
    setInterval([newMin, interval[1]]);
    act([newMin, interval[1]]);
  };

  const updateMax = (newMax: number) => {
    setInterval([interval[0], newMax]);
    act([interval[0], newMax]);
  };

  return (
    <div className={mainClass}>
      <NumberInput
        val={interval[0]}
        act={updateMin}
        real={real[0]}
        max={interval[1]}
				mainClass={inputClass}
				minusClass={minusClass}
				addClass={addClass}
				step={steps[0]}
      />
      <NumberInput
        val={interval[1]}
        act={updateMax}
        real={real[1]}
        min={interval[0]}
				mainClass={inputClass}
				minusClass={minusClass}
				addClass={addClass}
				step={steps[1]}
      />
    </div>
  );
}
