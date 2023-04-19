import { verifyNumber } from "@webtex/algom";
import { ChangeEvent, useEffect, useRef, useState } from "react";

function getNum(x: string, integerOnly: boolean = true) {
  const { num, kind } = verifyNumber(x);
  if (integerOnly && kind !== "integer") return null;
  switch (kind) {
    case "float":
    case "integer":
      return ((num as any) * 1);
    case "fraction": {
      const [N, D] = num.split("/");
      if (!N || !D) return null;
      const n = (N as any) * 1;
      const d = (D as any) * 1;
      return n / d;
    }
    case "hex":
      return Number.parseInt(num, 16);
    case "binary":
      return Number.parseInt(num, 2);
    case "scientific": {
      const val = num.split("E");
      let base = val[0] as any;
      if (!base) return null;
      let exp = val[1] as any;
      if (!exp) return null;
      base = (base) * 1;
      exp = (exp) * 1;
      const n = base * (10 ** exp);
      if (n > Number.MAX_SAFE_INTEGER) {
        return null;
      }
      return n;
    }
    case "complex-number":
    case "unknown":
      return null;
  }
}

export type _NumberInput = {
  val: number;
  act: (val: number) => void;
  real?: boolean;
  nonnegative?: boolean;
  min?: number;
  max?: number;
  mainClass?: string;
  minusClass?: string;
  addClass?: string;
  step?: number;
};

export function NumberInput({
  val,
  act,
  real = false,
  nonnegative = false,
  min = nonnegative ? 0 : -1000,
  max = 1000,
  step = real ? 0.001 : 1,
  mainClass = "",
  minusClass = "",
  addClass = "",
}: _NumberInput) {
  const [value, setValue] = useState(`${val}`);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const canPlus = ((val as any) * 1) < max;
  const onPlusClick = () => {
    const _input = inputRef.current;
    if (!_input) return;
    _input.stepUp();
    const maybeNum = getNum(_input.value, !real);
    if (maybeNum === null) return;
    setValue(`${maybeNum}`);
    act(maybeNum);
  };

  const canMinus = ((val as any) * 1) > min;

  const onMinusClick = () => {
    const _input = inputRef.current;
    if (!_input) return;
    _input.stepDown();
    const maybenum = getNum(_input.value, !real);
    if (maybenum === null) return;
    setValue(`${maybenum}`);
    act(maybenum);
  };
  const onKeyboardInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    const newval = e.target.value;
    if (newval === "") return;
    const maybeNum = getNum(newval, !real);
    if (maybeNum === null) return;
    setValue(`${maybeNum}`);
    act(maybeNum);
  };

  useEffect(() => {
    const elem = inputRef.current;
    if (elem === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" && canMinus) {
        onMinusClick();
        e.preventDefault();
        return;
      }
      if (e.code === "ArrowUp" && canPlus) {
        onPlusClick();
        e.preventDefault();
      }
    };
    elem.addEventListener("keydown", handleKeyDown);
    return () => elem.removeEventListener("keydown", handleKeyDown);
  }, [canMinus, canPlus]);

  return (
    <div className={mainClass}>
      <button
        className={minusClass}
        disabled={!canMinus}
        onClick={onMinusClick}
      >
        {"-"}
      </button>
      <input
        ref={inputRef}
        type={"number"}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onKeyboardInput}
      />
      <button
        className={addClass}
        disabled={!canPlus}
        onClick={onPlusClick}
      >
        {"+"}
      </button>
    </div>
  );
}
