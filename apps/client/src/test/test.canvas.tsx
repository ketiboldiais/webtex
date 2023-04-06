import { makeRows } from "src/chips/Sheet/sheet.aux";
import Sheet from "src/chips/Sheet/sheet.chip";
import app from "../ui/styles/App.module.scss";
import { theme } from "src/chips/EditorConfig";
import { HeadingNode } from "@lexical/rich-text";

export function Canvas() {
  return (
    <div id={app.canvas}>
    </div>
  );
}
