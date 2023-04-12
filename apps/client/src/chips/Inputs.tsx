import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BtnFn, InputFn } from "src/App";
import { concat, toggle } from "src/util";
import app from "../ui/styles/App.module.scss";

export interface ButtonProps {
  click: BtnFn;
  label?: string | ReactNode;
  className?: string;
  icon?: string | JSX.Element;
  btnTitle?: string;
  style?: CSSProperties;
}

export function Button({
  click,
  label,
  className = app.default_button,
  btnTitle,
  style,
}: ButtonProps) {
  return (
    <button
      style={style}
      title={btnTitle}
      onClick={click}
      className={className}
    >
      {label}
    </button>
  );
}

type TextInputProps = Readonly<{
  label?: string | ReactNode;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  value: string;
  defaultWidth?: number;
  grow?: boolean;
}>;

export function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  defaultWidth = 0,
  grow = true,
}: TextInputProps) {
  const [content, setContent] = useState("");
  const [width, setWidth] = useState(defaultWidth);
  const span = useRef<null | HTMLSpanElement>(null);
  useEffect(() => {
    if (span.current && grow) {
      setWidth(span.current.offsetWidth);
    }
  }, [content]);
  const update: InputFn = (e) => {
    e.stopPropagation();
    onChange(e.target.value);
    setContent(e.target.value);
  };
  return (
    <div className={className ? className : app.text_input_shell}>
      {label && (typeof label === "string" ? <label>{label}</label> : label)}
      <span className={app.text_input_hidden_span} ref={span}>
        {content}
      </span>
      <div className={app.text_input_field}>
        <input
          type={"text"}
          placeholder={placeholder}
          autoFocus
          value={value}
          onChange={update}
          style={{ width }}
        />
      </div>
    </div>
  );
}

interface FileInputProps {
  accept?: string;
  onChange: (files: FileList | null) => void;
}

export function FileInput({
  accept,
  onChange,
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
        onChange={(e) => onChange(e.target.files)}
      />
    </div>
  );
}

type NumberInputProps = Readonly<{
  value: number;
  onChange: (val: number) => void;
  className?: string;
  label?: string | ReactNode;
  noPropogate?: boolean;
}>;
export function NumberInput({
  label,
  value,
  onChange,
  className = "",
  noPropogate = false,
}: NumberInputProps) {
  const plus = () => onChange(value + 1);
  const minus = () => onChange(value - 1);
  return (
    <div className={concat(app.number, className)}>
      {label && typeof label === "string" ? <label>{label}</label> : label}
      <div className={app.number_input_body}>
        <button
          className={app.number_input_button}
          onClick={(event) => {
            noPropogate && event.stopPropagation();
            minus();
          }}
        >
          &minus;
        </button>
        <div className={app.number_input_field}>{value}</div>
        <button
          className={app.number_input_button}
          onClick={(event) => {
            noPropogate && event.stopPropagation();
            plus();
          }}
        >
          &#43;
        </button>
      </div>
    </div>
  );
}

interface RowProps {
  children: JSX.Element[];
}
export function Row({ children }: RowProps) {
  return (
    <div className={app.atom_row}>
      {children}
    </div>
  );
}

interface SwitchProps {
  onToggle: () => void;
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
}
export function Switch({
  onToggle,
  value,
  trueLabel = "",
  falseLabel = "",
}: SwitchProps) {
  return (
    <div>
      <label className={app.switch_shell}>
        <input
          type={"checkbox"}
          onChange={onToggle}
          checked={value}
          className={app.switch_checkbox}
        />
        <div className={app.switch_slider} />
      </label>
      {trueLabel && falseLabel && (
        <div className={toggle(app.switch_on, app.switch_off).on(value)}>
          <span
            onClick={() =>
              onToggle()}
            children={value ? trueLabel : falseLabel}
          />
        </div>
      )}
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
  initialValue?: number;
  maxValue?: number;
  minValue?: number;
  onChange?: (x: number) => void;
  step?: number;
}

import { scaleLinear } from "d3";
import { percentage } from "@webtex/algom";
import css from "../ui/styles/slider.module.scss";

const getLeft = (x: number) => `calc(${x}% - 8px)`;

export function Range({
  initialValue = 0,
  maxValue = 10,
  minValue = -10,
  onChange,
  step=0,
}: RangeAPI) {
  const initialPercent = percentage(initialValue, maxValue, minValue);
  const sliderRef = useRef<null | HTMLDivElement>(null);
  const thumbRef = useRef<null | HTMLDivElement>(null);
  const displayValue = useRef<null | HTMLElement>(null);
  const diff = useRef(0);
  const value = useRef(initialValue);

  const scale = useCallback((x: number) =>
    scaleLinear()
      .domain([0, 100])
      .range([minValue, maxValue])(x), [initialValue, maxValue, minValue]);

  const onUpdate = (value: number, percent: number) => {
    const thumb = thumbRef.current;
    const display = displayValue.current;
    if (!thumb || !display) return;
    thumb.style.left = getLeft(percent);
    display.textContent = `${value}`;
  };

  useLayoutEffect(() => {
    onUpdate(initialValue, initialPercent);
  }, [initialValue, onUpdate]);

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
    onChange && onChange(newValue);
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
        <Text of={minValue} />
        <div ref={sliderRef} className={css.track}>
          <div
            ref={thumbRef}
            className={css.thumb}
            onPointerDown={onPtrDown}
          />
        </div>
        <Text of={maxValue} />
      </div>
    </div>
  );
}
