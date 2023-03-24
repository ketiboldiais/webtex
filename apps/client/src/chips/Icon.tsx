import ParametricSVG from "./icons/parametric.svg";
import XyzSVG from "./icons/xyz.svg";
import XYSVG from "./icons/xy.svg";
import PolarSVG from "./icons/polar.svg";
import CalcSVG from "./icons/calculate.svg";
import SheetSVG from "./icons/sheet.svg";

function SheetIcon() {
  return (
    <>
      <img src={SheetSVG} />
      <label>Spreadsheet</label>
    </>
  );
}

function CalcIcon() {
  return (
    <>
      <img src={CalcSVG} />
      <label>Arithmetic</label>
    </>
  );
}
function PolarIcon() {
  return (
    <>
      <img src={PolarSVG} />
      <label>Polar Plot</label>
    </>
  );
}

export function XYIcon() {
  return (
    <>
      <img src={XYSVG} />
      {/* <label>2D Plot</label> */}
    </>
  );
}

function XYZIcon() {
  return (
    <>
      <img src={XyzSVG} />
      <label>3D Plot</label>
    </>
  );
}

function ParIcon() {
  return (
    <>
      <img src={ParametricSVG} />
      <label>Parametric Plot</label>
    </>
  );
}
