import {
  ChangeEvent,
  CSSProperties,
  forwardRef,
  Fragment,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BtnFn, InputFn } from "src/App";
import app from "../ui/styles/App.module.scss";

export interface ButtonProps {
  click?: MouseEventHandler<HTMLButtonElement>;
  label?: string | ReactNode;
  className?: string;
  icon?: string | JSX.Element;
  btnTitle?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export function Button({
  click,
  label,
  className = app.button,
  btnTitle,
  style,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      style={style}
      title={btnTitle}
      onClick={click}
      className={className}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export type TextInputProps = Readonly<{
  act: (val: string) => void;
  val: string;
  temp?: string;
}>;

export function TextInput({
  val,
  act,
  temp = "",
}: TextInputProps) {
  const [content, setContent] = useState(val);
  const update: InputFn = (e) => {
    e.stopPropagation();
    act(e.target.value);
    setContent(e.target.value);
  };
  return (
    <input
      type={"text"}
      placeholder={temp}
      className={app.textInput}
      value={content}
      onChange={update}
    />
  );
}

interface FileInputProps {
  accept?: string;
  act: (files: FileList | null) => void;
}

export function FileInput({
  accept,
  act,
}: FileInputProps) {
  return (
    <div className={app.file_upload}>
      <label className={app.file_upload_label} htmlFor="file-upload">
        Upload
      </label>
      <input
        type={"file"}
        id={"file-upload"}
        accept={accept}
        onChange={(e) => act(e.target.files)}
      />
    </div>
  );
}

type OptionalProps = {
  children?: ReactNode;
  label?: string;
  act: (x: boolean) => void;
  val: boolean;
};

export function Optional({
  children,
  label,
  act,
  val,
}: OptionalProps) {
  const checkbox = useRef<null | HTMLInputElement>(null);
  const update = () => {
    const _checkbox = checkbox.current;
    if (_checkbox === null) return;
    const val = _checkbox.checked;
    act(val);
    _checkbox.checked = !val;
  };
  return (
    <div className={app.checkform}>
      <span className={app.label}>
        <input
          type={"checkbox"}
          checked={val}
          ref={checkbox}
          onChange={update}
        />
        {label && <label>{label}</label>}
      </span>
      {val && children}
    </div>
  );
}

interface SwitchProps {
  act: (x: boolean) => void;
  val: boolean;
}
export function Switch({
  act,
  val,
}: SwitchProps) {
  const toggle = useRef<null | HTMLSpanElement>(null);
  const checkbox = useRef<null | HTMLInputElement>(null);
  const update = () => {
    const _checkbox = checkbox.current;
    if (_checkbox === null) return;
    const val = _checkbox.checked;
    act(!val);
    _checkbox.checked = !val;
  };
  return (
    <div className={app.switch}>
      <input
        type={"checkbox"}
        checked={val}
        ref={checkbox}
        value={val ? 1 : 0}
        onChange={update}
      />
      <span onClick={update} ref={toggle} className={val ? app.on : app.off}>
        <span className={app.toggle} />
      </span>
    </div>
  );
}

type TextRef = HTMLElement;

type TextProps = {
  of: string | number | null;
};

export const Text = forwardRef<TextRef, TextProps>((props, ref) => {
  return <var ref={ref}>{props.of}</var>;
});

interface RangeAPI {
  val?: number;
  max?: number;
  min?: number;
  act: (x: number) => void;
}

import { scaleLinear } from "d3";
import { percentage } from "@webtex/algom";
import css from "../ui/styles/slider.module.scss";

const getLeft = (x: number) => `calc(${x}% - 8px)`;

export function Range({
  val = 0,
  max = 10,
  min = -10,
  act,
}: RangeAPI) {
  const initialPercent = percentage(val, max, min);
  const sliderRef = useRef<null | HTMLDivElement>(null);
  const thumbRef = useRef<null | HTMLDivElement>(null);
  const displayValue = useRef<null | HTMLElement>(null);
  const diff = useRef(0);
  const value = useRef(val);

  const scale = useCallback((x: number) =>
    scaleLinear()
      .domain([0, 100])
      .range([min, max])(x), [val, max, min]);

  const onUpdate = (value: number, percent: number) => {
    const thumb = thumbRef.current;
    const display = displayValue.current;
    if (!thumb || !display) return;
    thumb.style.left = getLeft(percent);
    display.textContent = `${value}`;
  };

  useLayoutEffect(() => {
    onUpdate(val, initialPercent);
  }, [val, onUpdate]);

  const onPtrMove = (event: PointerEvent) => {
    const elem = sliderRef.current;
    if (!elem) return;
    const { left } = elem.getBoundingClientRect();
    const d = diff.current;
    let newX = event.clientX - d - left;
    const thumb = thumbRef.current;
    if (!thumb) return;
    const end = elem.offsetWidth - thumb.offsetWidth;
    const start = 0;
    newX = (newX < start) ? 0 : (newX > end ? end : newX);
    const newPercent = percentage(newX, end);
    thumb.style.left = getLeft(newPercent);
    const displayElem = displayValue.current;
    if (!displayElem) return;
    const newValue = scale(newPercent);
    value.current = newValue;
    displayElem.textContent = `${value.current}`;
    act(newValue);
  };

  const onPtrUp = () => {
    document.removeEventListener("pointerup", onPtrUp);
    document.removeEventListener("pointermove", onPtrMove);
  };

  const onPtrDown = (event: React.PointerEvent) => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    diff.current = event.clientX - thumb.getBoundingClientRect().left;
    document.addEventListener("pointermove", onPtrMove);
    document.addEventListener("pointerup", onPtrUp);
  };

  return (
    <div className={css.main}>
      <div className={css.header}>
        <Text ref={displayValue} of={value.current} />
      </div>
      <div className={app.hstack + " " + css.range}>
        <Text of={min} />
        <div ref={sliderRef} className={css.track}>
          <div
            ref={thumbRef}
            className={css.thumb}
            onPointerDown={onPtrDown}
          />
        </div>
        <Text of={max} />
      </div>
    </div>
  );
}

type pNumberIO = {
  val: number;
  act: (val: number) => void;
  min?: number;
  max?: number;
  nonnegative?: boolean;
  allowFloat?: boolean;
};

import { verifyNumber } from "@webtex/algom";
import { ColorPicker } from "./colorpicker.chip";
import { Children } from "src/util";

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

export function NumberInput({
  val,
  act,
  nonnegative = false,
  min = nonnegative ? 0 : -1000,
  max = 1000,
  allowFloat = false,
}: pNumberIO) {
  const [value, setValue] = useState(`${val}`);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const canPlus = ((val as any) * 1) < max;
  const onPlusClick = () => {
    const _input = inputRef.current;
    if (!_input) return;
    _input.stepUp();
    const maybeNum = getNum(_input.value, !allowFloat);
    if (maybeNum === null) return;
    setValue(`${maybeNum}`);
    act(maybeNum);
  };

  const canMinus = ((val as any) * 1) > min;

  const onMinusClick = () => {
    const _input = inputRef.current;
    if (!_input) return;
    _input.stepDown();
    const maybenum = getNum(_input.value, !allowFloat);
    if (maybenum === null) return;
    setValue(`${maybenum}`);
    act(maybenum);
  };
  const onKeyboardInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    const newval = e.target.value;
    if (newval === "") return;
    const maybeNum = getNum(newval, !allowFloat);
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
    <div className={app.numberInput}>
      <Button disabled={!canMinus} label={"-"} click={onMinusClick} />
      <input
        ref={inputRef}
        type={"number"}
        min={min}
        max={max}
        step={allowFloat ? 0.01 : 1}
        value={value}
        onChange={onKeyboardInput}
      />
      <Button disabled={!canPlus} label={"+"} click={onPlusClick} />
    </div>
  );
}

interface IntervalProps {
  val: [number, number];
  act: (interval: [number, number]) => void;
  allowFloats?: [boolean, boolean];
}
export function Interval({
  act,
  val,
  allowFloats = [false, false],
}: IntervalProps) {
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
    <div className={app.intervalInput}>
      <NumberInput
        val={interval[0]}
        act={updateMin}
        allowFloat={allowFloats[0]}
        max={interval[1]}
      />
      <NumberInput
        val={interval[1]}
        act={updateMax}
        allowFloat={allowFloats[1]}
        min={interval[0]}
      />
    </div>
  );
}

type OptionsListAPI<t extends string> = {
  options: t[];
  val: t;
  act: (x: t) => void;
};
export function OptionsList<t extends string>({
  options,
  val,
  act,
}: OptionsListAPI<t>) {
  const [picked, setPicked] = useState(val);
  const isPicked = (value: string) => value === picked;
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value as unknown as t;
    setPicked(val);
    act(val);
  };
  return (
    <div className={app.optionsList}>
      {options.map((option, i) => (
        <div key={option + i} className={app.option}>
          <label>{option}</label>
          <input
            checked={isPicked(option)}
            type={"radio"}
            key={option + i}
            value={option}
            onChange={pick}
          />
        </div>
      ))}
    </div>
  );
}

type pSlotLabel = {
  children: ReactNode;
  of: string;
};

export function SlotLabel({ children, of }: pSlotLabel) {
  return (
    <div className={app.slot_label}>
      <label className={app.slot_left}>{of}</label>
      {children}
    </div>
  );
}

type pPalette = {
  init?: string;
  act: (newcolor: string) => void;
};
export function Palette({
  act,
  init = "#000",
}: pPalette) {
  const [currentColor, setCurrentColor] = useState(init);
  const [openColor, setOpenColor] = useState(false);
  const update = (c: string) => {
    setCurrentColor(c);
    act(c);
  };
  return (
    <Fragment>
      <div
        className={app.colorpreview}
        style={{ backgroundColor: currentColor }}
        onClick={() => setOpenColor(!openColor)}
      />
      {openColor && <ColorPicker color={init} onChange={update} />}
    </Fragment>
  );
}

export type pForm = {
  onSave?: () => void;
  footers?: () => JSX.Element;
  headers?: () => JSX.Element;
  className?: string;
};
export function Form({
  children,
  headers,
  onSave,
  footers,
  className,
}: pForm & Children) {
  return (
    <menu className={app.form + (className ? " " + className : "")}>
      {headers && <header>{headers()}</header>}
      <article>
        {children}
      </article>
      <footer>
        {footers && footers()}
        {onSave && (
          <Button className={app.formsave} click={onSave} label={"Save"} />
        )}
      </footer>
    </menu>
  );
}

export type pField = {
  name: string;
};
export function Field({ name, children }: pField & Children) {
  return (
    <section>
      <label>{name}</label>
      {children}
    </section>
  );
}

type pCard = {
  onDelete?: () => void;
};
export function Card({ onDelete, children }: pCard & Children) {
  return (
    <div className={app.card}>
      {onDelete && (
        <header>
          <Button
            label={"\u00d7"}
            click={onDelete}
            className={app.delete}
          />
        </header>
      )}
      {children}
    </div>
  );
}
