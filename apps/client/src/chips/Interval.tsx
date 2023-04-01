import { ReactNode, useState } from "react";
import { NumberInput } from "./Inputs";
import app from '../ui/styles/App.module.scss';

interface IntervalProps {
  label: string | ReactNode;
  value: [number, number];
  minLabel?: string | ReactNode;
  maxLabel?: string | ReactNode;
  onChange: (interval: [number, number]) => void;
}
export function Interval(
  {
    label,
    onChange,
    value,
    minLabel,
    maxLabel,
  }: IntervalProps,
) {
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
    <div className={app.interval_chip}>
      <div className={app.interval_body}>
        <label className={app.interval_label}>{label}</label>
        <section className={app.interval_counters}>
          <div className={app.interval_row}>
            <NumberInput value={interval[0]} onChange={updateMin} />
            {minLabel && <label className={app.interval_input_label}>{minLabel}</label>}
          </div>
          <div className={app.interval_row}>
            <NumberInput value={interval[1]} onChange={updateMax} />
            {maxLabel && <label className={app.interval_input_label}>{maxLabel}</label>}
          </div>
        </section>
      </div>
    </div>
  );
}
