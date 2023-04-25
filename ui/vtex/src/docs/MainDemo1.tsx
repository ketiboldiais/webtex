import { Graph, graph, node } from "../lib";
import css from "../App.module.scss";

const graphDemo1 = graph(
  node("A").link(node("B")),
  node("C").link(node("D")),
  node("J").link(node("A")),
  node("N").link(node("C")),
  node("B").link(node("C")),
  node("A").link(node("N")),
)
  .height(200)
  .width(600)
  .margin(10);

export const GraphDemo1 = () => {
  return <Graph data={graphDemo1} className={css.redGraph} />;
};
