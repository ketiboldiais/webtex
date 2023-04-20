import { useState } from "react";
import { IPlot2d, Plot2D } from "../lib/plot2d/plot2d";
import css from '../App.module.scss';

export default function Plot2DPage() {
  const [data, setData] = useState<IPlot2d | null>(null);
  return (
    <article>
      <h2>Plot2D</h2>
      <p>The Plot2D module is 2D function plotter.</p>
      <Plot2D className={css.fig}/>
    </article>
  );
}
