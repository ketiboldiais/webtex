import { _Anchor } from "..";

export type _Label = {
  value?: string;
  anchor?: _Anchor;
  dx?: number;
  dy?: number;
  fontSize?: number | string;
  color?: string;
};
export function Label({
  value,
  anchor,
  dx,
  dy,
  fontSize,
  color,
}: _Label) {
  if (!value) return null;
  return (
    <text textAnchor={anchor} dx={dx} dy={dy} fontSize={fontSize} fill={color}>
      {value}
    </text>
  );
}
