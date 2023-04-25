export type N2 = [number, number];
export type N3 = [number, number, number];
export const shift = (x: number, y: number) => `translate(${x},${y})`;
const coord = (point: [number, number]) => `${point[0]},${point[1]}`;
const pairs = (p1: N2, p2: N2) => {
  const P1 = coord(p1);
  const P2 = coord(p2);
  return `${P1} ${P2}`;
};

export const AString = (
  rX: number,
  rY: number,
  rotation: number,
  arc: number,
  sweep: number,
  eX: number,
  eY: number,
) => {
  const val = `${rX},${rY} ${rotation}, ${arc}, ${sweep}, ${eX}, ${eY}`;
  return val;
};

export type SVG_A_Command = {
  rX: number;
  rY: number;
  rotation: number;
  arc: number;
  sweep: number;
  eX: number;
  eY: number;
};

const triples = (p1: N2, p2: N2, end: N2) => {
  const P1 = coord(p1);
  const P2 = coord(p2);
  const END = coord(end);
  return `${P1} ${END} ${P2}`;
};

export class SVGPath {
  private _value: string[] = [];
  constructor(startX: number, startY: number) {
    const M = `M${startX},${startY}`;
    this._value.push(M);
  }
  getWritable() {
    return this;
  }

  close(command: string = "z") {
    return this.addValue("", command);
  }

  get value() {
    const self = this.getWritable();
    const result = self._value.join(" ");
    return result;
  }

  private addValue(value: string, command: string) {
    const self = this.getWritable();
    self._value.push(command + value);
    return this;
  }
  private addCoord(x: number, y: number, command: string) {
    return this.addValue(coord([x, y]), command);
  }
  /**
   * Moves the pen to the exact
   * coordinates (x,y), regardless
   * of where the pen currenty is.
   */
  M(x: number, y: number) {
    return this.addCoord(x, y, "M");
  }
  /**
   * Given the current coordinate,
   * moves the pen x-units left or right
   * and y-units up or down.
   */
  m(x: number, y: number) {
    return this.addCoord(x, y, "m");
  }

  /**
   * Draws a straight line to the
   * absolute coordinates (x,y),
   * regardless of where the pen
   * currently is.
   */
  L(x: number, y: number) {
    return this.addCoord(x, y, "L");
  }

  /**
   * Given the current coordinate,
   * draws a straight line
   * x-units left or right,
   * and y-units up or down.
   */
  l(x: number, y: number) {
    return this.addCoord(x, y, "l");
  }

  /**
   * Draws a horizontal line to the
   * absolute coordinates (x,y),
   * regardless of where the pen
   * currently is.
   */
  H(x: number, y: number) {
    return this.addCoord(x, y, "H");
  }

  /**
   * Given the current coordinate,
   * draws a straight horizontal line
   * x-units left or right,
   * and y-units up or down.
   */
  h(x: number, y: number) {
    return this.addCoord(x, y, "h");
  }

  /**
   * Draws a vertical line to the
   * absolute coordinates (x,y),
   * regardless of where the pen
   * currently is.
   */
  V(x: number, y: number) {
    return this.addCoord(x, y, "V");
  }

  /**
   * Given the current position,
   * draws a straight vertical line
   * x-units left or right,
   * and y-units up or down.
   */
  v(x: number, y: number) {
    return this.addCoord(x, y, "v");
  }

  /**
   * Draws a straight line back to
   * the start of the path,
   * regardles of where
   * the current position is.
   */
  Z(x: number, y: number) {
    return this.addCoord(x, y, "Z");
  }
  /**
   * Given the current position,
   * draws a line back to the start
   * of the path.
   */
  z(x: number, y: number) {
    return this.addCoord(x, y, "z");
  }

  private addTriple(p1: N2, p2: N2, end: N2, command: string) {
    return this.addValue(triples(p1, p2, end), command);
  }
  /**
   * Regardless of the current position,
   * starts a Bezier curve's left handle at
   * p1, a right handle at p2, and an
   * endpoint at end.
   */
  C(p1: N2, p2: N2, end: N2) {
    return this.addTriple(p1, p2, end, "C");
  }

  /**
   * Given the current position,
   * starts a Bezier curve's left handle at
   * p1, a right handle at p2, and an
   * endpoint at end.
   */
  c(p1: N2, p2: N2, end: N2) {
    return this.addTriple(p1, p2, end, "c");
  }

  private addPair(p1: N2, p2: N2, command: string) {
    return this.addValue(pairs(p1, p2), command);
  }

  /**
   * Regardless of the current position,
   * draws a Bezier curve with the first handle at
   * p1 and the second handle at p2.
   */
  S(p1: N2, p2: N2) {
    return this.addPair(p1, p2, "S");
  }

  /**
   * Given the current position,
   * draws a Bezier curve with the first handle at
   * p1 and the second handle at p2.
   */
  s(p1: N2, p2: N2) {
    return this.addPair(p1, p2, "s");
  }

  /**
   * Regardless of the current position,
   * draws a quadratic Bezier curve with the first handle at
   * p1 and the second handle at p2.
   */
  Q(p1: N2, p2: N2) {
    return this.addPair(p1, p2, "Q");
  }

  /**
   * Given the current position,
   * draws a quadratic curve with the first handle at
   * p1 and the second handle at p2.
   */
  q(p1: N2, p2: N2) {
    return this.addPair(p1, p2, "q");
  }
  private addA(
    rX: number,
    rY: number,
    rotation: number,
    arc: number,
    sweep: number,
    eX: number,
    eY: number,
    command: "A" | "a",
  ) {
    const val = AString(rX, rY, arc, rotation, sweep, eX, eY);
    return this.addValue(val, command);
  }

  /**
   * Creates an A-command, disregarding the current position.
   */
  A({ rX, rY, rotation, arc, sweep, eX, eY }: SVG_A_Command) {
    return this.addA(rX, rY, rotation, arc, sweep, eX, eY, "A");
  }

  /**
   * Creates an A-command relative to the current position.
   */
  a({ rX, rY, rotation, arc, sweep, eX, eY }: SVG_A_Command) {
    return this.addA(rX, rY, rotation, arc, sweep, eX, eY, "a");
  }
}

/**
 * Creates a new SVG path d-string.
 * @param {number} [startX] - The starting x-coordinate of the path.
 * @param {number} [startY] - The starting y-coordinate of the path.
 */
export const path = (startX: number, startY: number) =>
  new SVGPath(startX, startY);

export const curve = (start: N2, end: N2) => {
  const x1 = start[0];
  const y1 = start[1];
  let eX = end[0];
  let eY = end[1];
  const hasLoop = x1 === eX && y1 === eY;
  const dx = eX - y1;
  const dy = eY - y1;
  const dr = Math.sqrt(dx * dx + dy * dy);
  const rX = hasLoop ? 12 : dr;
  const rY = hasLoop ? 12 : dr;
  const rotation = hasLoop ? -45 : 1;
  const arc = hasLoop ? 1 : 0;
  const sweep = 1;
  if (hasLoop) {
    eX = eX + 1;
    eY = eY + 1;
  }
  return path(x1, y1).A({ rX, rY, rotation, arc, sweep, eX, eY });
};

export const line = (start: N2, end: N2) => {
  const x1 = start[0];
  const y1 = start[1];
  const x2 = end[0];
  const y2 = end[1];
  return path(x1, y1).l(x2, y2);
};

export function getCenter(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  radius: number,
) {
  const t_radius = radius;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const gamma = Math.atan2(dy, dx);
  const tx = targetX - Math.cos(gamma) * t_radius;
  const ty = targetY - Math.sin(gamma) * t_radius;
  return [tx, ty];
}

export const arrow = (
  sourceData: string,
  targetData: string,
): _Arrow => ({
  id: `${sourceData}-to-${targetData}`,
});

export type _Arrow = { id: string };

export type _Arrows = {
  data: _Arrow[];
};
export function Arrows({ data }: _Arrows) {
  return (
    <defs>
      {data.map((arrow, i) => (
        <marker
          refX={10}
          refY={5}
          key={arrow.id + i}
          id={arrow.id}
          viewBox={"0 0 10 10"}
          markerUnits={"strokeWidth"}
          markerWidth={10}
          markerHeight={5}
          orient={"auto"}
        >
          <path d={path(0, 0).L(10, 5).L(0, 10).close("z").value} />
        </marker>
      ))}
    </defs>
  );
}
