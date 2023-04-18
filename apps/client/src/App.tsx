import "katex/dist/katex.css";
import { ChangeEvent } from "react";
import { ChangeEventHandler, MouseEventHandler } from "react";
import { Provider } from "react-redux";
import { store } from "./state/state.js";
import { Workspace } from "./chips/Workspace.js";

export function App() {
  return (
    <Provider store={store}>
      <Workspace />
    </Provider>
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
