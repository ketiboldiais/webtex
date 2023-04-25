/* eslint-disable no-unused-vars */
import { leaf, Tree, tree } from "../lib";

const data = tree("A")
  .nodes(
    leaf("N"),
    leaf("B"),
    tree("J").nodes(
      leaf("L"),
      leaf("D"),
      leaf("F"),
    ),
    leaf("K"),
    tree("Z").nodes(
      leaf("P"),
      leaf("Q"),
    ),
  ).curvedLinks();

export const TreeDemo1 = () => <Tree data={data} />;
