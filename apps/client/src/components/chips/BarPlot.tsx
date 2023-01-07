import { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';

type Datum = [string, number];
type Data = Datum[];

const getLabel = (d: string) => d;
const getValue = (d: number) => d;

type BarPlotArg = {
  width: number;
  height: number;
  data: Data;
  margins: [number, number, number, number];
};

const BarPlot = ({ width, height, data, margins }: BarPlotArg) => {
  const xMax = width - margins[1] - margins[3];
  const yMax = height - margins[0] - margins[2];
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: data.map((d) => d[0]),
        padding: 0.4,
      }),
    [xMax]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map((d) => d[1]))],
      }),
    [yMax]
  );
};

export { BarPlot };
