import { Figure } from "@/weave/Figure";
import { from, rand } from "@/weave/aux";
import {
  $Vector,
  axis,
  integral,
  distance,
  plane,
  plot,
  point,
  vector,
  angle,
} from "@/weave/weft/plot/plot.data";
import { useMemo } from "react";
import css from '../App.module.scss';

export const Plot1 = () => {
  const plot1 = plane(
    plot("f(x) = x^2").stroke("teal"),
    plot("f(x) = 2").stroke("grey").dash(3),
    plot("f(x) = sin(x)").stroke("tomato"),
    axis("x"),
    axis("y")
  )
    .dom(-2, 5)
    .ran(-3, 5);
  return <Figure of={plot1} />;
};

export const Plot2 = () => {
  const plot2 = plane(
    plot("f(x) = cos(x)").and(integral(-3, 3)),
    axis("x"),
    axis("y")
  )
    .dom(-5, 5)
    .ran(-5, 5);
  return <Figure of={plot2}/>;
};

export const TangentPlot = () => {
  const tanPlot = plane(
    plot("f(x) = tan(x)").stroke("#FFD93D"),
    axis("x"),
    axis("y")
  )
    .dom(-10, 10)
    .ran(-10, 10);
  return <Figure of={tanPlot} className={css['brown-palette']}/>;
};

export const GridPlane = () => {
  const grid = plane(axis("x"), axis("y"))
    .dom(-5, 5)
    .ran(-5, 5)
    .grid("xy");
  return <Figure of={grid} />;
};

export const PointPlane = () => {
  const randpoints = from(-5)
    .to(5)
    .step(0.1)
    .map((_) => point(rand(-5, 5), rand(-5, 5)));
  const points = plane(...randpoints, axis("x"), axis("y"))
    .dom(-5, 5)
    .ran(-5, 5)
    .grid("xy");
  return <Figure of={points} />;
};

export const VectorPlane = () => {
  const randVectors = useMemo(
    () =>
      from(-5)
        .to(5)
        .step(0.2)
        .map((_) =>
          vector([rand(-5, 5), rand(-5, 5)]).stroke("#F266AB")
        ),
    []
  );
  const vectors = plane(axis("x"), axis("y"), randVectors)
    .dom(-5, 5)
    .ran(-5, 5)
    .grid("xy");
  return <Figure of={vectors} />;
};

export const Vector1 = () => {
  const label = (v: $Vector, d: number) => [
    v.line().dash(2).stroke("#98EECC"),
    v.label(d.toPrecision(4)).at(v.midpoint()),
  ];
  const vectorFormat = (v: number[][]) =>
    distance(
      vector(v[0]).origin(1, 1),
      vector(v[1]).origin(1, 1),
      label
    );
  const vectors = [
    [
      [1, 3],
      [3, 3],
    ],
    [
      [-4.6, 1],
      [-4, -4.5],
    ],
    [
      [2, -3],
      [3, -1],
    ],
    [
      [-3.5, 4.78],
      [-3, -1],
    ],
  ].map(vectorFormat);
  const vectorsDiagram = plane(axis("x"), axis("y"), ...vectors)
    .dom(-5, 5)
    .ran(-5, 5)
    .grid("xy");
  return <Figure of={vectorsDiagram} />;
};

export const Vector2 = () => {
  // const v7 = vector([0, 2]);
  // const v8 = vector([2, 0]);
  // const v7 = vector([-1,-1]);
  // const v8 = vector([-2,1]);
  // const v7 = vector([1,-3]);
  // const v8 = vector([2,-3]);
  const v7 = vector([-3,-1]);
  const v8 = vector([-2,-4]);
  const vectors = plane(
    axis("x"), 
    axis("y"), 
    // angle(v1, v2),
    // angle(v7, v8),
    // angle(v7, v8),
    angle(v7, v8),
    v7.label('v1').at(v7.midpoint()),
    v8.label('v2').at(v8.midpoint())
  )
    .dom(-5, 5)
    .ran(-5, 5)
    .grid("xy");
  return <Figure of={vectors} />;
};
