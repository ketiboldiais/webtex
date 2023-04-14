import { concat, toggle } from "src/util";
import { ReactNode, useState } from "react";
import app from "../ui/styles/App.module.scss";
import { Text } from "./Inputs";

interface Props {
  children: ReactNode;
  summary: string;
  initOpen?: boolean;
}
export function Detail({
  children,
  summary,
  initOpen = false,
}: Props) {
  const [open, setOpen] = useState(initOpen);
  const toggle = () => setOpen(!open);
  return (
    <div className={app.detail}>
      <div
        className={open ? app.vertical : app.horizontal}
        onClick={toggle}
        children={"\u25b6"}
      />
      <label onClick={toggle}>{summary}</label>
      <div className={open ? app.show : app.hide}>
        {children}
      </div>
    </div>
  );
}
