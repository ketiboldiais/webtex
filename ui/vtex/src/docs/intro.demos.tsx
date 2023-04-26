import { Graph, graph, node } from "../lib";

export const IntroDemo0 = () => {
  const graphData = graph(
    node("f").link(node("g")),
    node("f").link(node("i")),
    node("g").link(node("h")),
    node("g").link(node("k")),
    node("j").link(node("i")),
  );
  return <Graph data={graphData} />;
};

export const RedGraph = () => {
  const graphData = graph(
    node("f").link(node("g")),
    node("f").link(node("i")),
    node("g").link(node("h")),
    node("g").link(node("k")),
    node("j").link(node("i")),
  ).nodeStyles({
    fill: 'tomato',
    stroke: 'crimson',
  }).edgeStyles({
    stroke: 'red',
    strokeDasharray: 3
  });

  return <Graph data={graphData} />;
};
