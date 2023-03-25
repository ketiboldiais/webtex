import { ReactNode, useEffect, useRef, useState } from "react";
import dropdown from "../ui/styles/dropdown.module.scss";
import { createPortal } from "react-dom";
import { concat } from "src/util";

interface props {
  /** The title shown for the currently selected dropdown option. */
  title?: string | ReactNode;
  children?: ReactNode;

  /** Whether the title button should have the class `fixed` (which sets a constant width).  */
  fixedWidth?: boolean;

  /** Whether the dropdown should auto-close when an option is clicked. */
  selfClose?: boolean;
}
export function Dropdown({ title, children, selfClose, fixedWidth }: props) {
  const [dropdown_is_open, open_dropdown] = useState(false);

  const dropdownRef = useRef<HTML_DIV_REF>(null);
  const btnRef = useRef<HTML_BUTTON_REF>(null);

  useEffect(() => {
    const button = btnRef.current;
    if (button === null) return;
    const dropdown = dropdownRef.current;
    if (dropdown === null) return;

    const { top, left } = button.getBoundingClientRect();
    dropdown.style.top = `${top + 25}px`;
    dropdown.style.left = `${
      Math.min(left, window.innerWidth - dropdown.offsetWidth - 20)
    }px`;
  }, [dropdownRef, btnRef, dropdown_is_open]);

  useEffect(() => {
    const button = btnRef.current;
    if (button === null) return;
    if (!dropdown_is_open) return;
    const handle = (event: MouseEvent) => {
      const target = event.target;
      if (selfClose && dropdownRef.current?.contains(target as Node)) return;
      if (!button.contains(target as Node)) open_dropdown(false);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [dropdownRef, btnRef, dropdown_is_open, selfClose]);

  const open = () => open_dropdown(!dropdown_is_open);

  return (
    <div className={dropdown.dropdown}>
      <button
        className={concat(
          dropdown.item,
          dropdown.title,
          fixedWidth ? dropdown.fixedWidth : "",
        )}
        onClick={open}
        ref={btnRef}
      >
        {title}
      </button>
      {dropdown_is_open && createPortal(
        <div ref={dropdownRef} className={dropdown.options}>
          {children}
        </div>,
        document.body,
      )}
    </div>
  );
}
