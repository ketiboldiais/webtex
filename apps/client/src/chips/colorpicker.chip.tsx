import { ReactNode, useState } from "react";

const WIDTH = 214;
const HEIGHT = 150;

type pColorPicker = {
  disabled?: boolean;
  children?: ReactNode;
  onChange?: (color: string) => void;
  autoclose?: boolean;
  color?: string;
};

export function ColorPicker({
  disabled = false,
  children,
  onChange,
  autoclose,
  color = "#000",
}: Readonly<pColorPicker>) {
  const [currentColor, setCurrentColor] = useState(
    colorTransform("hex", color),
  );
  return <div>color picker</div>;
}

/* Helpers ------------------------------------------------------------------ */

function rgb(r: number, g: number, b: number) {
  return ({ r, g, b });
}
type RGB = ReturnType<typeof rgb>;

function hsv(h: number, s: number, v: number) {
  return ({ h, s, v });
}
type HSV = ReturnType<typeof hsv>;

function toHex(value: string) {
  const L = value.length;
  return (L === 4 || L === 5)
    ? value.split("").map((v, i) => (i ? v + v : "#")).join("")
    : (L === 7 || L === 9 ? value : "#000000");
}

function hexToRGB(hex: string): RGB {
  const rbg = hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (_, r, g, b) => "#" + r + r + g + g + b + b,
    )
    .substring(1)
    .match(/.{2}/g);
  if (!rbg) return rgb(0, 0, 0);
  const rbgarr = rbg.map((x) => parseInt(x, 16));
  return rgb(rbgarr[0], rbgarr[1], rbgarr[2]);
}

function rgbToHSV({ r, g, b }: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);

  const h = d
    ? (max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
      ? 2 + (b - r) / d
      : 4 + (r - g) / d) * 60
    : 0;
  const s = max ? (d / max) * 100 : 0;
  const v = max * 100;

  return hsv(h, s, v);
}

function hsvToRGB({ h, s, v }: HSV): RGB {
  s /= 100;
  v /= 100;
  const i = ~~(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const index = i % 6;

  const r = Math.round([v, q, p, p, t, v][index] * 255);
  const g = Math.round([t, v, v, q, p, p][index] * 255);
  const b = Math.round([p, p, t, v, v, q][index] * 255);
  return rgb(r, g, b);
}

function rgbToHex({ r, g, b }: RGB) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function newColor(hex: string, hsv: HSV, rgb: RGB): Color {
  return ({
    hex,
    hsv,
    rgb,
  });
}

type Color = {
  hex: string;
  hsv: HSV;
  rgb: RGB;
};

function colorTransform<f extends keyof Color, c extends Color[f]>(
  format: f,
  color: c,
) {
  let hex: Color["hex"] = toHex("#121212");
  let rgb: Color["rgb"] = hexToRGB(hex);
  let hsv: Color["hsv"] = rgbToHSV(rgb);
  switch (format) {
    case "hex": {
      const value = color as Color["hex"];
      hex = toHex(value);
      rgb = hexToRGB(hex);
      hsv = rgbToHSV(rgb);
      break;
    }
    case "rgb": {
      const value = color as Color["rgb"];
      rgb = value;
      hex = rgbToHex(rgb);
      hsv = rgbToHSV(rgb);
      break;
    }
    case "hsv": {
      const value = color as Color["hsv"];
      hsv = value;
      rgb = hsvToRGB(hsv);
      hex = rgbToHex(rgb);
      break;
    }
  }
  return newColor(hex, hsv, rgb);
}
