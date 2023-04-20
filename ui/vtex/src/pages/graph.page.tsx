import { Graph } from "../lib/graph/graph";
import css from "../App.module.scss";

export default function GraphPage() {
  return (
    <Graph
      data={(node) => [
        node("A").to(node("B")),
        node("E").to(node("A")),
        node("B").to(node("C")),
        node("D").to(node("A")),
        node('D').loop,
      ]}
      className={css.fig}
      nodeFill={"salmon"}
      nodeStroke={"firebrick"}
      edgeColor={"firebrick"}
    />
  );
}
