import { getData } from "../core/data";
import { axis, AxisXY, PlotAxis } from "../core/axis";
import { Clip } from "../core/clip";
import { _Core } from "../core/datum";
import { Group } from "../core/group";
import { SVG } from "../core/svg";
import { Asymptote } from "./asymptote";
import { f, Fn, FnCurve, FPlotFactory } from "./data";

export type Plottable = Fn;
interface _Plot extends _Core {
  /**
   * The callback function providing
   * the array of functions to plot.
   * Provides the function `FPlotFactory`
   * function `f`. This function creates
   * `Fn` objects, which specify the functions
   * to plot.
   */
  data: (f: FPlotFactory) => Plottable[];

  /**
   * An array of asymptotes to render.
   * Asymptotes must be created with `asymptote`
   * function, provided by the Asymptote module.
   */
  asymptotes?: Asymptote[];

  /**
   * The callback function providing a
   * pair of axes, the first being the
   * x-axis, and the second being the y-axis.
   *
   * The global domain of the function
   * to render. All function ranges will be
   * scaled according to the interval
   * passed. Defaults to [-10,10].
   *
   * The global range of the function
   * to render. All function ranges will be
   * scaled according to the interval
   * passed. Defaults to [-10,10].
   */
  axes?: (axisX: AxisXY, axisY: AxisXY) => [AxisXY, AxisXY];

  /**
   * The number of ticks for the graphs axes.
   * Defaults to 10.
   */
  ticks?: number;

  /**
   * How many samples should be taken for
   * each function passed. Setting this to
   * a high number will render a more precise
   * and smoother rendering, at the cost of
   * performance and memory. Defaults to
   * 170.
   */
  samples?: number;

  /**
   * The default font family used for text
   * elements.
   */
  fontFamily?: string;
}
export const Plot2D = ({
  id,
  data,
  asymptotes = [],
  axes,
  samples = 170,
  width = 500,
  height = 500,
  margin = 50,
  className = "vtex-Plot",
}: _Plot) => {
  const Functions = data(f);
  const svgWidth = width - margin;
  const svgHeight = height - margin;
  const xAxis = axis("x").max(svgWidth).bounds([-10, 10]);
  const yAxis = axis("y").max(svgHeight).bounds([-10, 10]);
  const Asymptotes = asymptotes.map((v) => getData.asymptote(v));
  const Axes = axes ? axes(xAxis, yAxis) : [xAxis, yAxis];
  const Data = { Functions, Axes, Asymptotes };
  const xAxisData = getData.axisXY(Data.Axes[0]);
  const yAxisData = getData.axisXY(Data.Axes[1]);
  const yMin = yAxisData.bounds[0];
  const yMax = yAxisData.bounds[1];
  const xMin = xAxisData.bounds[0];
  const xMax = xAxisData.bounds[1];

  return (
    <SVG width={width} height={height} className={className} debug>
      <Clip id={id} width={svgWidth} height={svgHeight} />
      <Group dx={margin / 2} dy={margin / 2}>
        <PlotAxis data={yAxisData} dx={xAxisData.scale(0)} dy={0} />
        <PlotAxis data={xAxisData} dx={0} dy={yAxisData.scale(0)} />
        {Data.Asymptotes.map(({ value, direction, styles }) => (
          <line
            x1={xAxisData.scale(direction == "x" ? value : xMin)}
            y1={yAxisData.scale(direction === "x" ? yMin : value)}
            x2={xAxisData.scale(direction === "x" ? value : xMax)}
            y2={yAxisData.scale(direction === "x" ? yMax : value)}
            stroke={styles.color}
            strokeDasharray={styles.dash}
            strokeWidth={styles.width}
          />
        ))}
        {Data.Functions.map((fn, i) => (
          <FnCurve
            id={id}
            key={id + i}
            data={getData.fn(fn)}
            xScale={xAxisData.scale}
            yScale={yAxisData.scale}
            samples={fn._samples || samples}
          />
        ))}
      </Group>
    </SVG>
  );
};

