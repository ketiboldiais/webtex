import { Figure } from "@/weave/Figure";
import { e, graph, v } from "@/weave/weft/graph/graph.data";

export const Graph1 = () => {
  const graph1 = graph(
    e(v("a"), v("b"), v("n")),
    v("j").neighbors(v("r"), v("w"), v("a")),
    v("d").neighbors(v("n"), v("j"), v("p")),
    v("p").neighbors(v("r"), v("j"), v("k")),
  ).height(280).width(600).margins(10,10);
  return <Figure of={graph1} />;
};
