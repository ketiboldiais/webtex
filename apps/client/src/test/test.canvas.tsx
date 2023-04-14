import GRAPH from "src/chips/Graph/graph.chip";
import Sheet from "../chips/Sheet/sheet.chip";
import app from "../ui/styles/App.module.scss";
import Plot1 from '../chips/Plot2d/plot2d.chip';
import { Range } from "src/chips/Inputs";

export function Canvas() {
  return (
    <div id={app.canvas}>
      <Sheet/>
      {/* <Plot1/> */}
      {/* <GRAPH/> */}
    </div>
  );
}
