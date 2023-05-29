import { Figure } from "@/index";
import { leaf, tree } from "@/weave/weft/tree/tree.data.js";

export const Tree1 = () => {
  const tree1 = tree("a")
    .branch(
      tree("b")
        .branch(tree("c").child("x").child("y"), leaf("d")),
      tree("e")
        .branch(leaf("f"), leaf("g")),
    ).color("nodes", "#DDFFBB").color("edges", "#829460").height(200);
  return <Figure of={tree1} />;
};

export const Tree2 = () => {
  const tree2 = tree("a")
    .branch(
      tree('b').branch(
        leaf('x'),
        leaf('y'),
        leaf('z')
      ),
      tree('c').branch(
        leaf('r'),
        tree('w').branch(
          leaf('p'),
          leaf('u')
        )
      ),
    ).color("nodes", "#FFF2CC").color("edges", "#DFA67B").height(200).curve();
  return <Figure of={tree2} />;
};
