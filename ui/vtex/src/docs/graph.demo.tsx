import { Graph, graph, node } from "../lib";

export const Graph1A = () => {
  const graphA = graph(
    node(1).link(node(2)),
    node(3).link(node(1)),
    node(8).link(node(3)),
    node(2).link(node(3)),
    node(9).link(node(3)),
  ).width(500).height(500).margins(150, 50);
  return <Graph data={graphA} />;
};

export const Digraph1 = () => {
  const digraphData = graph(
    node("Sam").to(node("John")),
    node("Lisa").to(node("Sam")),
    node("Kyle").to(node("Soyi")),
    node("Lisa").to(node("Kyle")),
    node("Soyi").to(node("Sam")),
    node("Sam").to(node("Elle")),
  ).width(500).height(500).margins(180,100)
  .nodeStyles({
    radius: 4,
    fill: 'tomato'
  }).textStyles({
    dx: 15,
    dy: 15
  });
  return <Graph data={digraphData} />;
};

export const ShortestPath1 = () => {
  const digraphData = graph(
    node("J").to(node("S")),
    node("A").to(node("L")),
    node("N").to(node("K")),
    node("N").to(node("S")),
    node("J").to(node("K")),
    node("K").to(node("S")),
    node("S").to(node("A")),
    node("S").to(node("E")),
    node("A").to(node("J")),
    node("L").to(node("J")),
  ).width(500).height(500).margins(180,100)
  .nodeStyles({
    radius: 4,
    fill: 'tomato'
  }).textStyles({
    dx: -12,
    dy: 0
  });
  return <Graph data={digraphData} />;
};
