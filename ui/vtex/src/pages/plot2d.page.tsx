import {useState} from "react";
import { IPlot2d, Plot2D, SVG } from "../lib/plot2d";



export default function Plot2DPage() {
	const [data, setData] = useState<IPlot2d|null>(null);
  return (
    <article>
      <h2>Plot2D</h2>
      <p>The Plot2D module is 2D function plotter.</p>
			{data && <Plot2D {...data}/>}
    </article>
  );
}
