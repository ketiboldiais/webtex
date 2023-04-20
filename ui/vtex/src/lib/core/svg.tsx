import { CSSProperties, ReactNode } from "react";

export type SVGProps = {
  width?: number;
  height?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  children?: ReactNode;
  className?: string;
  debug?: boolean;
};

export function SVG({
  width = 500,
  height = 500,
  children,
  className="",
  debug=false,
}: SVGProps) {
  const VB = `0 0 ${width} ${height}`;
  const boxCSS: CSSProperties = {
    display: "inline-block",
    position: "relative",
    width: `100%`,
    paddingBottom: `${100 * (height / width)}%`,
    overflow: "hidden",
    border: debug ? 'solid thin black' : '0'
  };
  const svgCSS: CSSProperties = {
    display: "inline-block",
    position: "absolute",
    top: `0`,
    left: `0`,
    right: `0`,
    bottom: `0`,
  };
  const par = "xMidYMid meet";
  return (
    <figure className={className}>
      <div style={boxCSS}>
        <svg viewBox={VB} preserveAspectRatio={par} style={svgCSS}>
          {children}
        </svg>
      </div>
    </figure>
  );
}
