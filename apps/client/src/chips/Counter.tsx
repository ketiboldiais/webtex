import { ReactNode, useState } from "react";
import counter from "../ui/styles/Counter.module.scss";

interface CounterProps {
  onDecrement: (n: number) => number;
  onIncrement: (n: number) => number;
  initialValue: number;
  label?: string | ReactNode;
}

export function Counter(
  {
    onDecrement,
    onIncrement,
    initialValue,
    label,
  }: CounterProps,
) {
  const [value, setValue] = useState(initialValue);
  const decrement = () => setValue(onDecrement(value));
  const increment = () => setValue(onIncrement(value));
  return (
    <div className={counter.container}>
      <div className={counter.field}>
        <button onClick={decrement}>{"-"}</button>
        <input
          type={"number"}
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber)}
          className={counter.input}
        />
        <button onClick={increment}>{"+"}</button>
      </div>
      <div className={counter.label}>{label}</div>
    </div>
  );
}
