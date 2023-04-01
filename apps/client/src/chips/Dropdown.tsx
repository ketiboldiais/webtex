import { ReactNode, useEffect, useRef, useState } from "react";
import app from "../ui/styles/App.module.scss";
import { createPortal } from "react-dom";
import { Button, ButtonProps, HTML_BUTTON_REF, HTML_DIV_REF } from "../App";
import { Conditioned } from "./Inputs";

interface props {
  title?: string | ReactNode;
  children?: ReactNode;
  selfClose?: boolean;
  className?: string;
}
export function Dropdown({ title, children, selfClose, className }: props) {
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
    <div>
      <button
        className={app.defaultButton}
        onClick={open}
        ref={btnRef}
      >
        {title}
      </button>
      {dropdown_is_open && createPortal(
        <div ref={dropdownRef} className={app.dropdown_options}>
          {children}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function DropdownItem({ click, label, icon }: ButtonProps) {
  return (
    <div className={app.dropdown_item}>
      <Button
        label={
          <div className={app.dropdown_label}>
            <Conditioned on={icon !== undefined}>
              {icon}
            </Conditioned>
            <span className={app.dropdown_item_title}>{label}</span>
          </div>
        }
        click={click}
      />
    </div>
  );
}
