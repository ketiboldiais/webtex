import { _Core } from "../lib/core/datum";
import { integral } from "../lib/plot2d/integral";
import { asymptote } from "../lib/plot2d/asymptote";
import { Plot2D } from "../lib/plot2d/plot2d";
import { Plot3D } from "../lib/plot3d/plot3d";

export default function Plot2DPage() {
  return (
    <article>
      <h2>Plot2D</h2>
      <p>
        The Plot2D module is a 2D function plotter. Plot2D takes a declarative
        approach to rendering.
      </p>
      <Demo />
      <Plot3D id={'plot3d'}/>
    </article>
  );
}

const Demo = () => {
  return (
    <Plot2D
      id={"my-plot"}
      axes={(axisX, axisY) => [
        axisX.scale("linear").bounds([-10, 10]).ticks(10),
        axisY.scale("linear").bounds([-10, 10]).ticks(10),
      ]}
      data={(f) => [
        f("x").equals("tan(x)"),
      ]}
    />
  );
};
