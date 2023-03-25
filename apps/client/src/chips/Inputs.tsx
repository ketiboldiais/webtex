import { ReactNode } from "react";

type Props = Readonly<{
  label: string | ReactNode;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  value: string;
}>;

export function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  className,
}: Props) {
  return (
    <div className={className}>
      {typeof label === "string" ? <label>{label}</label> : label}
      <input
        type={"text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface FileInputProps {
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}

export function FileInput({
  accept,
  label,
  onChange,
}: FileInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={"file"}
        accept={accept}
        onChange={(e) => onChange(e.target.files)}
      />
    </div>
  );
}

type NumberInputProps = Readonly<{
  label: string | ReactNode;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  value: number;
}>;
export function NumberInput({
  label,
  value,
  onChange,
  placeholder = "",
  className,
}: NumberInputProps) {
  return (
    <div className={className}>
      {typeof label === "string" ? <label>{label}</label> : label}
      <input
        type={'number'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    </div>
  );
}
