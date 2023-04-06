import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
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
      <Conditioned on={label !== undefined}>
        {typeof label === "string" ? <label>{label}</label> : label}
      </Conditioned>
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
}>;
export function NumberInput({
  label,
  value,
  onChange,
  className = "",
}: NumberInputProps) {
  const plus = () => onChange(value + 1);
  const minus = () => onChange(value - 1);
  return (
    <div className={concat(className, app.number)}>
      {label && typeof label === "string" ? <label>{label}</label> : label}
      <div className={app.number_input_body}>
        <button className={app.number_input_button} onClick={minus}>
          &minus;
        </button>
        <div className={app.number_input_field}>{value}</div>
        <button className={app.number_input_button} onClick={plus}>
          &#43;
        </button>
      </div>
    </div>
  );
}

interface CP {
  on: boolean | string | undefined | null;
  children: ReactNode;
}
export function Conditioned({ on, children }: CP) {
  return <>{on && children}</>;
}

interface TP {
  on: boolean;
  children: ReactNode[];
}
export function Ternary({ on, children }: TP) {
  return on ? <>{children[0]}</> : <>{children[1]}</>;
}
interface RP {
  html: string;
}
export function DIV({ html }: RP) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
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
      <Conditioned on={trueLabel && falseLabel}>
        <div className={toggle(app.switch_on, app.switch_off).on(value)}>
          <Ternary on={value}>
            <span onClick={() => onToggle()}>{trueLabel}</span>
            <span onClick={() => onToggle()}>{falseLabel}</span>
          </Ternary>
        </div>
      </Conditioned>
    </div>
  );
}
