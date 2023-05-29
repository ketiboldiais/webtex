import { colorable } from "../../../weave/warp/colorable.js";

class MapNode {
  value: string;
  constructor(value: string | number) {
    this.value = `${value}`;
  }
  to(mapnode: string | number) {
    return mapLink(node(mapnode), node(mapnode));
  }
}
const node = (value: string | number) => {
  const fig = colorable(MapNode);
  return new fig(value);
};
type MapNodeFn = typeof node;
type $MapNode = ReturnType<MapNodeFn>;

class MapLink {
  source: $MapNode;
  target: $MapNode;
  constructor(source: $MapNode, target: $MapNode) {
    this.source = source;
    this.target = target;
  }
}
const mapLink = (source: $MapNode, target: $MapNode) => {
  const fig = colorable(MapLink);
  return new fig(source, target);
};
type MapLinkFn = typeof mapLink;
type $MapLink = ReturnType<MapLinkFn>;

class Mapping {
  links: $MapLink[];
  constructor(links: $MapLink[]) {
    this.links = links;
  }
}
const mapping = (f: (n: MapNodeFn, l: MapLinkFn) => $MapLink[]) => {
  const fig = Mapping;
  const data = f(node, mapLink);
  return new fig(data);
};

const d = mapping((node, link) => [
  node("a").to("b"),
  node("c").to("d"),
  node("e").to("f"),
  node("j").to("c"),
]);
