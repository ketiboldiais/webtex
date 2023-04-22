import { ReactNode } from "react";

type _Group = {
  dx?: number;
  dy?: number;
  children?: ReactNode;
};
export function Group({
  dx = 0,
  dy = 0,
  children,
}: _Group) {
  return (
    <g transform={`translate(${dx}, ${dy})`}>
      {children}
    </g>
  );
}
