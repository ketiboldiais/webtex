import { concat, toggle } from "src/util";
import { ReactNode, useState } from "react";
import app from "../ui/styles/App.module.scss";

interface Props {
  children: ReactNode;
  summary: string;
  bodyClass?: string;
  buttonClass?: string;
  initOpen?: boolean;
}
export function Detail({
  children,
  summary,
  buttonClass = "",
  bodyClass = "",
  initOpen = false,
}: Props) {
  const [open, setOpen] = useState(initOpen);
  return (
    <div className={app.detail_shell}>
      <button onClick={() => setOpen(!open)} className={app.detail_advance_button}>
        <span
          className={concat(
            app.detail_triangle,
            toggle(app.detail_vertical, app.detail_horizontal).on(open),
          )}
        >
          &#9654;
        </span>
        <span>{summary}</span>
      </button>
      <div
        className={concat(
          bodyClass ? bodyClass : app.detail_body,
          toggle(app.detail_show, app.detail_hide).on(open),
        )}
      >
        {children}
      </div>
    </div>
  );
}
