export type _FileInput = {
  accept: string;
  act: (files: FileList | null) => void;
  className?: string;
  id?: string;
};

export function FileInput({
  accept,
  act,
  className = "",
  id = "",
}: _FileInput) {
  return (
    <input
      type={"file"}
      accept={accept}
      onChange={(event) => act(event.target.files)}
      className={className}
      id={id}
    />
  );
}
