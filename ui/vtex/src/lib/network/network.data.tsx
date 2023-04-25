import {
  Circular,
  Classable,
  Colorable,
  Movable,
  Sketchable,
  Textual,
  Unique,
} from "../core/core.utils";

/* eslint-disable no-unused-vars */
class ATOM {
  _value: string | number;
  constructor(value: string | number) {
    this._value = value;
  }
  data() {
    const value = this._value;
    return {
      value,
    };
  }
  value() {
    return this._value;
  }
}
const atom = (value: string | number) => new ATOM(value);

const NODE = Classable(Textual(Movable(
  Sketchable(
    Circular(
      Colorable(
        Unique(ATOM),
      ),
    ),
  ),
)));

const node = (value: string | number) => new NODE(value);

export type $NODE = ReturnType<typeof node>;

const getNodeData = (target: $NODE) => {
  const id = target.id();
  const value = target.value();
  const stroke = target.getStroke("currentColor");
  const fill = target.getStroke("inherit");
  const strokeWidth = target.getStrokeWidth(1);
  const radius = target.getRadius(5);
  const opacity = target.getOpacity(1);
  const positions = target.getPositions();
  const fontFamily = target.getFont("inherit");
  const textAnchor = target.getTextAnchor("middle");
  const fontSize = target.getFontSize(10);
  const color = target.getColor("inherit");
  const className = target.getClassName();
  const styles = {
    stroke,
    fill,
    radius,
    opacity,
    strokeWidth,
    fontFamily,
    textAnchor,
    fontSize,
    color,
    className,
    ...positions,
  };
  const data = {
    id,
    value,
    styles,
  };
  return data;
};

class EDGE {
  _source: $NODE;
  _target: $NODE;
  _weight?: number;
  constructor(source: $NODE, target: $NODE) {
    this._source = source;
    this._target = target;
  }
  data() {
    const source = getNodeData(this._source);
    const target = getNodeData(this._target);
    const sid = source.id;
    const tid = target.id;
    const id = sid + "-" + tid;
    const result = {
      source,
      target,
      id,
    };
  }
  /**
   * Assigns the given value
   * as a weight to the edge.
   */
  weight(value:number) {
    this._weight = value;
    return this;
  }
}

const edge = (source:$NODE, target:$NODE) => new EDGE(source, target)

