import intervalStyles from '../ui/styles/Interval.module.scss';
import { ReactNode, useState } from "react";
import { Counter } from "./Counter";

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
    <div className={intervalStyles.component}>
      <div className={intervalStyles.body}>
        <label className={intervalStyles.label}>{label}</label>
        <section className={intervalStyles.counters}>
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
        </section>
      </div>
    </div>
  );
}
