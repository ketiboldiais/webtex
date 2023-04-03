import "katex/dist/katex.css";
import { ChangeEvent } from "react";
import app from "./ui/styles/App.module.scss";
import { ChangeEventHandler, MouseEventHandler, ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./state/state.js";
import { Workspace } from "./chips/Workspace.js";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sheet from "./chips/Sheet/sheet.chip";
import { makeRows } from "./chips/Sheet/sheet.aux";
import { ColorPicker } from "./chips/colorpicker.chip";

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<Workspace />} />
          <Route path={"/canvas"} element={<Canvas />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

function Canvas() {
  return (
    <div className={app.canvas}>
      {/* <Sheet rows={makeRows(5, 5)} devmode /> */}
      <ColorPicker />
    </div>
  );
}

export interface ButtonProps {
  click: BtnFn;
  label?: string | ReactNode;
  className?: string;
  icon?: string | JSX.Element;
  btnTitle?: string;
}

export function Button(
  { click, label, className = app.defaultButton, btnTitle }: ButtonProps,
) {
  return (
    <button title={btnTitle} onClick={click} className={className}>
      {label}
    </button>
  );
}

export type LiFn = MouseEventHandler<HTMLLIElement>;
export type DivFn = MouseEventHandler<HTMLDivElement>;
export type LiEvt = Parameters<LiFn>[0];
export type InputFn = ChangeEventHandler<HTMLInputElement>;
export type BtnFn = MouseEventHandler<HTMLButtonElement>;
export type BtnEvt = Parameters<BtnFn>[0];
export type VoidFunction = () => void;
export type Pair<t> = [t, t];
export type Triple<t> = [t, t, t];
export type Quad<t> = [t, t, t, t];
export type HTML_DIV_REF = HTMLDivElement | null;
export type HTML_IMG_REF = HTMLImageElement | null;
export type SVG_REF = SVGElement | null;
export type HTML_BUTTON_REF = HTMLButtonElement | null;
export type StrNull = string | null;
export type TextInputEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;
export type EVENT_INPUT = ChangeEvent<HTMLInputElement>;
export type HTML_TABLE_REF = HTMLTableElement | null;
