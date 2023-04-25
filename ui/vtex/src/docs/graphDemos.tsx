import { edge, Graph, graph, node } from "../lib";
import css from "../App.module.scss";

export const Graph1 = () => {
  const graphDemo1 = graph(
    node("A").link(node("B")),
    node("C").link(node("D")),
    node("J").link(node("A")),
    node("N").link(node("C")),
    node("B").link(node("C")),
    node("A").link(node("C")),
    node("J").link(node("E")),
    node("E").link(node("D")),
    node("E").link(node("B")),
    node('K').link(node("N")),
  )
    .height(300)
    .width(600)
    .margin(10);

  return <Graph data={graphDemo1} className={css.blueGraph} />;
};

export const GraphWithEdge = () => {
  const graphDemoEdges = graph(
    edge(node("A"), node("B")),
    edge(node("A"), node("B")),
    edge(node("C"), node("D")),
    edge(node("J"), node("A")),
    edge(node("N"), node("C")),
    edge(node("B"), node("C")),
    edge(node("A"), node("C")),
    edge(node("J"), node("E")),
    edge(node("E"), node("D")),
    edge(node("E"), node("B")),
  )
    .height(300)
    .width(600)
    .margin(10);

  return <Graph data={graphDemoEdges} className={css.blueGraph} />;
};
