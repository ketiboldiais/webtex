import { axis, f, integral, plot, Plot2D } from "../lib";

export const Plot2D1 = () => {
  const plotData1 = plot(
    axis("x"),
    axis("y"),
    f("x").equals("x^2").stroke("red"),
    f("x").equals("2x - 1").stroke("blue"),
  );
  return <Plot2D data={plotData1} />;
};

export const Integral1 = () => {
  const plotData1 = plot(
    axis("x").ticks(8),
    axis("y").ticks(8),
    f("x").equals("cos(x)/2")
      .stroke("red")
      .and(integral(-3, 3).fill("gold")),
  ).domain(-5,5).range(-1,1);

  return <Plot2D data={plotData1} />;
};
