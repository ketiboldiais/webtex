import GRAPH from "src/chips/Graph/graph.chip";
import Sheet from "../chips/Sheet/sheet.chip";
import app from "../ui/styles/App.module.scss";
import Plot1 from "../chips/Plot2d/plot2d.chip";
import { Range } from "src/chips/Inputs";
import { Plot3DPrompt } from "src/chips/Plot3d/plot3d.prompt";

export function Canvas() {
  return (
    <div id={app.canvas}>
      {/* <Sheet /> */}
      {/* <Plot2DPrompt/> */}
      {/* <Plot3DPrompt/> */}
    </div>
  );
}
