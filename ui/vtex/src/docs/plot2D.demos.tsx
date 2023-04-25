/* eslint-disable no-unused-vars */
import { axis, f, latex, Plot2D, plot2D, riemann } from "../lib";
import css from '../App.module.scss';

export const Plot2D_Demo1 = () => {
  const data = plot2D(
    axis("x").latex("x"),
    axis("y").latex("y"),
    f("x").equals("2x^2"),
    f("x").equals("cos(x)"),
    latex("f(x) = \\cos(x)").at(-4, -1.5),
    latex("f(x) = 2x^2").at(2, 3),
  ).domain(-5, 5).range(-5, 5);

  return <Plot2D data={data} className={css.plot2d}/>;
};

export const PlotFig2 = () => {
  const data = plot2D(
    axis("x").latex("x"),
    axis("y").latex("y"),
    f("x").equals("x^3").and(riemann(-2, 2)),
  ).domain(-5, 5).range(-5, 5);

  return <Plot2D data={data} className={css.plot2d}/>;
};
