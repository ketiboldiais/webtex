import { useRef } from "react";

export type _Switch = {
  act: (value: boolean) => void;
  val: boolean;
  className?: string;
  onClass?: string;
  offClass?: string;
  toggleClass?: string;
};

export function Switch({
  act,
  val,
  className = "",
  toggleClass = "",
  onClass = "",
  offClass = "",
}: _Switch) {
  const toggle = useRef<null | HTMLSpanElement>(null);
  const checkbox = useRef<null | HTMLInputElement>(null);
  const update = () => {
    const checkboxElement = checkbox.current;
    if (checkboxElement === null) return;
    const value = checkboxElement.checked;
    act(!value);
    checkboxElement.checked = !value;
  };
  return (
    <div className={className}>
      <input
        type={"checkbox"}
        checked={val}
        ref={checkbox}
        value={val ? 1 : 0}
        onChange={update}
      />
      <span
        onClick={update}
        ref={toggle}
        className={val ? onClass : offClass}
      >
        <div className={toggleClass} />
      </span>
    </div>
  );
}
