import { MouseEventHandler, ReactNode } from "react";

export type _Button = {
  click?: MouseEventHandler<HTMLButtonElement>;
  label?: ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
};

export function Button({
  click,
  label = "",
  className = "",
  title = "",
  disabled = false,
}: _Button) {
  return (
    <button
      onClick={click}
      className={className}
      title={title}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
