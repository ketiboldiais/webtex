import app from "../ui/styles/App.module.scss";
import { PointXY } from "@hooks/useBoxSelect";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Inputs";
import { schema } from "./EditorConfig";
import { clamp } from "src/algom";

const WIDTH = 200;
const HEIGHT = 150;

type pColorPicker = {
  onChange?: (color: string) => void;
  color?: string;
};

export function ColorPicker({
  onChange,
  color = "#000",
}: Readonly<pColorPicker>) {
  const [selfColor, setSelfColor] = useState(
    colorTransform("hex", color),
  );
  const [inputColor, setInputColor] = useState(color);
  const innerDivRef = useRef(null);
  const saturationPosition = useMemo(
    () => ({
      x: (selfColor.hsv.s / 100) * WIDTH,
      y: ((100 - selfColor.hsv.v) / 100) * HEIGHT,
    }),
    [selfColor.hsv.s, selfColor.hsv.v],
  );

  const huePosition = useMemo(() => ({
    x: (selfColor.hsv.h / 360) * WIDTH,
  }), [selfColor.hsv]);

  const onSetHex = (hex: string) => {
    setInputColor(hex);
    hex = hex.trimStart().trimEnd();
    hex = (hex.startsWith("#") ? "" : "#") + hex.toUpperCase();
    if (/^#[0-9A-F]{6}$/) {
      setSelfColor(colorTransform("hex", hex));
    }
  };

  const onMoveSaturation = ({ x, y }: { x: number; y: number }) => {
    const newHSV = {
      ...selfColor.hsv,
      s: (x / WIDTH) * 100,
      v: 100 - (y / HEIGHT) * 100,
    };
    const updatedColor = colorTransform("hsv", newHSV);
    setSelfColor(updatedColor);
    setInputColor(updatedColor.hex);
  };

  const onMoveHue = ({ x }: { x: number }) => {
    const newHSV = { ...selfColor.hsv, h: (x / WIDTH) * 360 };
    const updatedColor = colorTransform("hsv", newHSV);
    setSelfColor(updatedColor);
    setInputColor(updatedColor.hex);
  };

  useEffect(() => {
    if (innerDivRef.current && onChange) {
      onChange(selfColor.hex);
      setInputColor(selfColor.hex);
    }
  }, [selfColor, onChange]);

  useEffect(() => {
    if (!color) return;
    const updatedColor = colorTransform("hex", color);
    setSelfColor(updatedColor);
    setInputColor(updatedColor.hex);
  }, [color]);

  return (
    <div className={app.color_picker}>
      <div
        className={app.color_picker_shell}
        style={{ width: WIDTH }}
        ref={innerDivRef}
      >
        <div className={app.hex_input}>
          <span className={app.hex_input_label}>Hex</span>
          <input
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            className={app.color_picker_text_input}
          />
        </div>
        <div className={app.starter_palette}>
          {schema.colors.map((color) => (
            <Button
              key={color}
              style={{ backgroundColor: color }}
              click={() => {
                setInputColor(color);
                setSelfColor(colorTransform("hex", color));
              }}
            />
          ))}
        </div>
        <Spectrum
          className={app.color_picker_saturation}
          style={{ backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)` }}
          onChange={onMoveSaturation}
        >
          <div
            className={app.saturation_cursor}
            style={{
              backgroundColor: selfColor.hex,
              left: saturationPosition.x,
              top: saturationPosition.y,
            }}
          />
        </Spectrum>
        <Spectrum className={app.color_picker_hue} onChange={onMoveHue}>
          <div
            className={app.hue_cursor}
            style={{
              backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
              left: huePosition.x,
            }}
          />
        </Spectrum>
        <div
          className={app.color_picker_color}
          style={{ backgroundColor: selfColor.hex }}
        />
      </div>
    </div>
  );
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

type pSpectrumPlane = {
  className?: string;
  style?: CSSProperties;
  onChange: (position: PointXY) => void;
  children: JSX.Element;
};

function Spectrum({
  className,
  style,
  onChange,
  children,
}: pSpectrumPlane) {
  const divRef = useRef<HTMLDivElement>(null);

  const move = (e: React.MouseEvent | MouseEvent) => {
    if (divRef.current) {
      const { current: div } = divRef;
      const { width, height, left, top } = div.getBoundingClientRect();
      const x = clamp(e.clientX - left, width, 0);
      const y = clamp(e.clientY - top, height, 0);
      onChange({ x, y });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    move(e);
    const onMouseMove = (evt: MouseEvent) => move(evt);
    const onMouseUp = (evt2: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);
      move(evt2);
    };
    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseup", onMouseUp, false);
  };
  return (
    <div
      ref={divRef}
      className={className}
      style={style}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
}
