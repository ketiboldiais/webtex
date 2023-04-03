import { ReactNode, useEffect, useRef, useState } from "react";
import app from "../ui/styles/App.module.scss";
import { createPortal } from "react-dom";
import { Button, ButtonProps, HTML_BUTTON_REF, HTML_DIV_REF } from "../App";
import { Conditioned } from "./Inputs";
import { concat } from "src/util";

interface props {
  title?: string | ReactNode;
  children?: ReactNode;
  selfClose?: boolean;
  open?: boolean;
  className?: string;
  buttonClass?: string;
  topOffset?: number;
  leftOffset?: number;
  containerClass?: string;
}
export function Dropdown({
  title,
  children,
  selfClose,
  open = false,
  className = "",
  buttonClass = app.defaultButton,
  topOffset = 25,
  leftOffset = 20,
  containerClass="",
}: props) {
  const [dropdown_is_open, open_dropdown] = useState(open);
  const dropdownRef = useRef<HTML_DIV_REF>(null);
  const btnRef = useRef<HTML_BUTTON_REF>(null);

  useEffect(() => {
    const button = btnRef.current;
    if (button === null) return;
    const dropdown = dropdownRef.current;
    if (dropdown === null) return;

    const { top, left } = button.getBoundingClientRect();
    dropdown.style.top = `${top + topOffset}px`;
    dropdown.style.left = `${
      Math.min(left, window.innerWidth - dropdown.offsetWidth - leftOffset)
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

  const setOpen = () => open_dropdown(!dropdown_is_open);

  return (
    <div className={concat(app.dropdown_shell, containerClass)}>
      <button className={buttonClass} onClick={setOpen} ref={btnRef}>
        <span className={app.dropdown_current}>{title}</span>
      </button>
      <Conditioned on={dropdown_is_open}>
        {createPortal(
          <div
            ref={dropdownRef}
            className={concat(app.dropdown_options, className)}
          >
            {children}
          </div>,
          document.body,
        )}
      </Conditioned>
    </div>
  );
}

type pDropdownItem = ButtonProps & {
  className?: string;
  children?: ReactNode;
};

export function Option(
  { click, label, icon, children, className = "" }: pDropdownItem,
) {
  return (
    <div className={concat(app.dropdown_item, className)}>
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
      {children}
    </div>
  );
}
