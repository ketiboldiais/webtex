type Props = Readonly<{
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
}>;

export function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
}: Props) {
  return (
    <div>
      <label>{label}</label>
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
