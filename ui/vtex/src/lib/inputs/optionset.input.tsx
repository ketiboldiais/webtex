import { ChangeEvent, useState } from "react";

export type _OptionSet<t extends string> = {
  options: t[];
  val: t;
  act: (x: t) => void;
  mainClass: string;
};

export function OptionSet<t extends string>({
  options,
  val,
  act,
  mainClass,
}: _OptionSet<t>) {
  const [picked, setPicked] = useState(val);
  const isPicked = (value: string) => value === picked;
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value as unknown as t;
    setPicked(val);
    act(val);
  };
  return (
    <div className={mainClass}>
      {options.map((option, i) => (
        <div key={option + i}>
          <label>{option}</label>
          <input
            checked={isPicked(option)}
            type={"radio"}
            value={option}
            onChange={pick}
          />
        </div>
      ))}
    </div>
  );
}
