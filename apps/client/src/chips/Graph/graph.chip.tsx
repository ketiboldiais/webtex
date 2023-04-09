import core from "../../ui/styles/App.module.scss";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  ForceX,
  forceX,
  ForceY,
  forceY,
  SimulationNodeDatum,
} from "d3-force";
import { ReactNode, useRef, useState } from "react";
import { HTML_DIV_REF, Quad } from "src/App";
import { svgDimensions } from "../PlotUtils";
import { Html } from "src/util";
import Plot1 from "../Plot2d/plot2d.chip";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  value: string;
}

type Link = { source: number; target: number };
const makeLink = (
  sourceId: number,
  targetId: number,
): Link => ({ source: sourceId, target: targetId });

// type Links = Link[];

const defaultNodes: GraphNode[] = [
  { id: "A", value: "apple" },
  { id: "M", value: "mango" },
  { id: "D", value: "durian" },
  { id: "P", value: "plum" },
];

const testEdges: Link[] = [
  { source: 0, target: 1 },
  { source: 2, target: 0 },
  { source: 3, target: 2 },
];

const centerForce = (x: number, y: number) => forceCenter().x(x / 2).y(y / 2);

type FX = ForceX<SimulationNodeDatum>;
type FY = ForceY<SimulationNodeDatum>;
const newForce = <t extends (FX | FY)>(
  dir: "x" | "y",
  dimension: number,
  strength: number,
): t => {
  const f = dir === "x" ? forceX : forceY;
  return f(dimension / 2).strength(strength) as t;
};

interface GraphProps {
  /**
   * An array of vertices.
   * A vertex is an object of the form
   * ~~~
   * {id: string, value: string}
   * ~~~
   * The id value must be unique.
   */
  nodes?: GraphNode[];

  /**
   * An array of links.
   * A link is an object of the form:
   * ~~~
   * {source: string, target:string}
   * ~~~
   * where the `source` and `target`
   * values are unique ids. The ids
   * must correspond to the nodes
   * provided in the `nodes` prop.
   */
  links?: Link[];

  /** The SVG's width. */
  width?: number;

  /** The SVG's height. */
  height?: number;

  /** The SVG's margins against its parent div. */
  margins?: Quad<number>;

  /**
   * How strongly each node should repel or attract
   * one another. A positive value will cause
   * nodes to attrach one another, and a negative
   * value will cause nodes to repel one another.
   * I.e., the smaller this value is, the more "dense"
   * or "clumped" the graph looks. The larger this value
   * is, the more "spread out" the graph looks.
   */
  nodeForceStrength?: number;

  /**
   * Specifies the length of edges between their endpoint
   * nodes.
   */
  edgeLength?: number;

  /**
   * Places an upper bound on how much the nodes
   * can be separated. Specifying this number and keeping
   * it small improves performance.
   */
  maxNodeSeparation?: number;

  /**
   * Determines how strongly each node
   * is attracted towards their given x-coordinate.
   * Defaults to the provided strength value.
   */
  forceXStrength?: number;

  /**
   * Determines how strongly each node
   * is attracted towards their given y-coordinate.
   * Defaults to the provided strength value.
   */
  forceYStrength?: number;
}

export default function GRAPH({
  nodes = defaultNodes,
  links = testEdges,
  nodeForceStrength = 0.01,
  forceXStrength = 0.01,
  forceYStrength = 0.01,
  edgeLength = 30,
  maxNodeSeparation = 100,
  width = 500,
  height = 500,
  margins = [50, 50, 50, 50],
}: GraphProps) {
  const [svgWidth, svgHeight] = svgDimensions(width, height, margins);
  const manyBody = forceManyBody()
    .strength(nodeForceStrength)
    .distanceMax(maxNodeSeparation);
  const graphCenter = centerForce(svgWidth, svgHeight);
  const forceX: FX = newForce("x", svgWidth, nodeForceStrength);
  const forceY: FY = newForce("y", svgHeight, nodeForceStrength);
  const edgeForce = forceLink(links).distance(edgeLength);
  const graphForce = forceSimulation(nodes)
    .force("charge", manyBody)
    .force("link", edgeForce)
    .force("center", graphCenter)
    .force("x", forceX)
    .force("y", forceY)
    .stop();
  graphForce.tick(200);

  return <div>p</div>;
}

export function FDemo() {
  return (
    <Figure
      width={400}
      height={400}
    >
      <Plot1 fs={[{ variable: "x", expression: "x^2" }]} />
    </Figure>
  );
}



type divref = null | HTMLDivElement;
interface FigAPI {
  children: ReactNode;
  width: number;
  height: number;
}
export function Figure({
  children,
  width,
  height
}: FigAPI) {
  const container = useRef<divref>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = () => {
    setTimeout(() => {
      setIsResizing(false);
      setIsSelected(false);
    }, 200);
  };


  return (
    <>
      <div className={core.resizer}>
        <div
          ref={container}
          className={isSelected ? core.resizeFocus : ""}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            overflow: "hidden",
          }}
          onClick={() => setIsSelected(!isSelected)}
        >
          {children}
        </div>
        {(isSelected||isResizing) && (
          <Resizer
            targetRef={container}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </>
  );
}

type Dim = number | "inherit";
interface ResizerAPI {
  targetRef: { current: null | HTMLElement };
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

enum D {
  east = 1 << 0,
  north = 1 << 3,
  south = 1 << 1,
  west = 1 << 2,
}

type Pos = {
  currentHeight: "inherit" | number;
  currentWidth: "inherit" | number;
  direction: number;
  isResizing: boolean;
  ratio: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
};

type Ptr = React.PointerEvent<HTMLDivElement>;
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Resizer({
  targetRef,
  maxWidth = 800,
  maxHeight = 800,
  minWidth = 200,
  minHeight = 200,
  onResizeStart,
  onResizeEnd,
}: ResizerAPI) {
  const ctrlWrapper = useRef<HTML_DIV_REF>(null);
  const userSelect = useRef({
    priority: "",
    value: "default",
  });

  const positioningRef = useRef<Pos>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });

  if (targetRef.current) {
    const t = targetRef.current;
    // maxWidth = t.getBoundingClientRect().width;
    // const p = t.parentElement;
    // if (p) {
      // maxWidth = p.getBoundingClientRect().width;
      // const pp = p.parentElement;
      // if (pp) {
        // maxWidth = pp.getBoundingClientRect().width;
      // }
    // }
  }

  if (targetRef.current) {
    const t = targetRef.current;
    // maxHeight = t.getBoundingClientRect().height;
    // const p = t.parentElement;
    // if (p) {
      // maxHeight = p.getBoundingClientRect().height;
      // const pp = p.parentElement;
      // if (pp) {
        // maxHeight = pp.getBoundingClientRect().height;
      // }
    // }
  }

  const setStartCursor = (direction: number) => {
    const elem = targetRef.current;
    const cursorDir = getCursorPos(direction);
    if (elem !== null) {
      elem.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important",
      );
    }
    if (document.body !== null) {
      document.body.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important",
      );
      userSelect.current.value = document.body.style.getPropertyValue(
        "-webkit-user-select",
      );
      userSelect.current.priority = document.body.style.getPropertyPriority(
        "-webkit-user-select",
      );
      document.body.style.setProperty(
        "-webkit-user-select",
        `none`,
        "important",
      );
    }
  };

  const setEndCursor = () => {
    const elem = targetRef.current;
    if (elem !== null) {
      elem.style.setProperty("cursor", "default");
    }
    if (document.body !== null) {
      document.body.style.setProperty("cursor", "default");
      document.body.style.setProperty(
        "-webkit-user-select",
        userSelect.current.value,
        userSelect.current.priority,
      );
    }
  };

  const handlePointerDown = (event: Ptr, direction: number) => {
    const image = targetRef.current;
    const controlWrapper = ctrlWrapper.current;

    if (image !== null && controlWrapper !== null) {
      const { width, height } = image.getBoundingClientRect();
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.startHeight = height;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX;
      positioning.startY = event.clientY;
      positioning.isResizing = true;
      positioning.direction = direction;

      setStartCursor(direction);
      onResizeStart();

      image.style.height = `${height}px`;
      image.style.width = `${width}px`;

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const image = targetRef.current;
    const positioning = positioningRef.current;

    const isHorizontal = positioning.direction & (D.east | D.west);
    const isVertical = positioning.direction & (D.south | D.north);

    if (image !== null && positioning.isResizing) {
      // Corner cursor
      if (isHorizontal && isVertical) {
        let diff = Math.floor(positioning.startX - event.clientX);
        diff = positioning.direction & D.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidth,
        );

        const height = width / positioning.ratio;
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
        positioning.currentHeight = height;
        positioning.currentWidth = width;
      } else if (isVertical) {
        let diff = Math.floor(positioning.startY - event.clientY);
        diff = positioning.direction & D.south ? -diff : diff;

        const height = clamp(
          positioning.startHeight + diff,
          minHeight,
          maxHeight,
        );

        image.style.height = `${height}px`;
        positioning.currentHeight = height;
      } else {
        let diff = Math.floor(positioning.startX - event.clientX);
        diff = positioning.direction & D.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidth,
        );

        image.style.width = `${width}px`;
        positioning.currentWidth = width;
      }
    }
  };
  const handlePointerUp = () => {
    const image = targetRef.current;
    const positioning = positioningRef.current;
    const controlWrapper = ctrlWrapper.current;
    if (image !== null && controlWrapper !== null && positioning.isResizing) {
      positioning.startWidth = 0;
      positioning.startHeight = 0;
      positioning.ratio = 0;
      positioning.startX = 0;
      positioning.startY = 0;
      positioning.currentWidth = 0;
      positioning.currentHeight = 0;
      positioning.isResizing = false;
      setEndCursor();
      onResizeEnd();
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    }
  };

  return (
    <div ref={ctrlWrapper}>
      <div
        onPointerDown={(e) => handlePointerDown(e, D.north)}
        className={core.n}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.north | D.east)}
        className={core.ne}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.east)}
        className={core.e}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.south | D.east)}
        className={core.se}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.south)}
        className={core.s}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.south | D.west)}
        className={core.sw}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.west)}
        className={core.w}
      />
      <div
        onPointerDown={(e) => handlePointerDown(e, D.north | D.west)}
        className={core.nw}
      />
    </div>
  );
}

function getCursorPos(dir: number) {
  const ew = dir === D.east || dir === D.west;
  const ns = dir === D.north || dir === D.south;
  const nw = dir & D.north && dir & D.west;
  const se = dir & D.south && dir & D.east;
  const nwse = nw || se;
  return ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";
}
