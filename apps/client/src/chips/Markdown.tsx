import { TextMatchTransformer } from "@lexical/markdown";
import { $createLatexNode, $isLatexNode, LatexNode } from "./Latex";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
export const EQUATION: TextMatchTransformer = {
  dependencies: [LatexNode],
  export: (node) => {
    if (!$isLatexNode(node)) {
      return null;
    }
    return `$${node.getLatex()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createLatexNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};
const transformers = [EQUATION];

export function MarkdownPlugin(): JSX.Element {
  return <MarkdownShortcutPlugin transformers={transformers} />;
}
