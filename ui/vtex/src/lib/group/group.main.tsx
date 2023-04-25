import { ReactNode } from "react";

type _Group = {
  dy?: number;
  dx?: number;
  children?: ReactNode;
  styles?: any;
  markerEnd?: string;
  className?: string;
  color?: string;
};
export const Group = ({
  dy = 0,
  dx = 0,
  children,
  styles,
  markerEnd,
  className,
  color,
}: _Group) => {
  const transform = `translate(${dx},${dy})`;
  markerEnd = markerEnd ? `url(#${markerEnd})` : undefined;
  const Styles = {
    className,
    markerEnd,
    color,
    transform,
    ...styles,
  };
  return <g {...Styles}>{children}</g>;
};
