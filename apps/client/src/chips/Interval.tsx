import { ReactNode, useState } from "react";
import { NumberInput } from "./Inputs";
import app from "../ui/styles/App.module.scss";

interface IntervalProps {
  label?: string | ReactNode;
  value: [number, number];
  minLabel?: string | ReactNode;
  maxLabel?: string | ReactNode;
  onChange: (interval: [number, number]) => void;
  /**
   * Targets the interval component's wrapper.
   */
  containerClass?: string;
  /**
   * Targets the counters' wrapper.
   */
  dataClass?: string;
  /**
   * Targets the interval's label.
   */
  labelClass?: string;
  /**
   * Targets each individual counter
   * box.
   */
  counterClass?: string;
  /**
   * Targets each counter's label.
   */
  inputLabelClass?: string;
}
export function Interval({
  label,
  onChange,
  value,
  minLabel,
  maxLabel,
  containerClass = app.interval_chip,
  dataClass = app.interval_counters,
  labelClass = app.interval_label,
  counterClass = app.interval_row,
  inputLabelClass = app.interval_input_label,
}: IntervalProps) {
  const [interval, updateInterval] = useState(value);

  const updateMin = (newMin: number) => {
    if (newMin < interval[1]) {
      onChange([newMin, interval[1]]);
      updateInterval([newMin, interval[1]]);
    }
  };
  const updateMax = (newMax: number) => {
    if (newMax > interval[0]) {
      onChange([interval[0], newMax]);
      updateInterval([interval[0], newMax]);
    }
  };

  return (
    <div className={containerClass}>
      <label className={labelClass}>{label}</label>
      <section className={dataClass}>
        <div className={counterClass}>
          <NumberInput value={interval[0]} onChange={updateMin} />
          {minLabel && <label className={inputLabelClass}>{minLabel}</label>}
        </div>
        <div className={counterClass}>
          <NumberInput value={interval[1]} onChange={updateMax} />
          {maxLabel && <label className={inputLabelClass}>{maxLabel}</label>}
        </div>
      </section>
    </div>
  );
}
