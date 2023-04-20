import { scaleLinear } from "d3";
import { percentage } from "@webtex/algom";
import { useCallback, useLayoutEffect, useRef } from "react";

export type _Range = {
  val: number;
  max: number;
  min: number;
  act: (n: number) => void;
  mainClass?: string;
  headerClass?: string;
  rangeClass?: string;
  trackClass?: string;
  thumbClass?: string;
  leftOffset?: number;
  trackWidth?: string | number;
};

const getLeft = (leftOffset: number) => (x: number) => {
  return `calc(${x}% - ${leftOffset}px)`;
};

export function Range({
  val,
  max,
  min,
  act,
  mainClass,
  headerClass,
  rangeClass,
  trackClass,
  thumbClass,
  leftOffset = 8,
  trackWidth = 170,
}: _Range) {
  const calcLeft = getLeft(leftOffset);
  const initialPercent = percentage(val, max, min);
  const sliderRef = useRef<null | HTMLDivElement>(null);
  const thumbRef = useRef<null | HTMLDivElement>(null);
  const displayValue = useRef<null | HTMLDivElement>(null);
  const diff = useRef(0);
  const value = useRef(val);

  const scale = useCallback((x: number) =>
    scaleLinear()
      .domain([0, 100])
      .range([min, max])(x), [val, max, min]);

  const onUpdate = (value: number, percent: number) => {
    const thumb = thumbRef.current;
    const display = displayValue.current;
    if (!thumb || !display) return;
    thumb.style.left = calcLeft(percent);
    display.textContent = `${value}`;
  };

  useLayoutEffect(() => {
    onUpdate(val, initialPercent);
  }, [val, onUpdate]);

  const onPtrMove = (event: PointerEvent) => {
    const elem = sliderRef.current;
    if (!elem) return;
    const { left } = elem.getBoundingClientRect();
    const d = diff.current;
    let newX = event.clientX - d - left;
    const thumb = thumbRef.current;
    if (!thumb) return;
    const end = elem.offsetWidth - thumb.offsetWidth;
    const start = 0;
    newX = (newX < start) ? 0 : (newX > end ? end : newX);
    const newPercent = percentage(newX, end);
    thumb.style.left = calcLeft(newPercent);
    const displayElem = displayValue.current;
    if (!displayElem) return;
    const newValue = scale(newPercent);
    value.current = newValue;
    displayElem.textContent = `${value.current}`;
    act(newValue);
  };

  const onPtrUp = () => {
    document.removeEventListener("pointerup", onPtrUp);
    document.removeEventListener("pointermove", onPtrMove);
  };

  const onPtrDown = (event: React.PointerEvent) => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    diff.current = event.clientX - thumb.getBoundingClientRect().left;
    document.addEventListener("pointermove", onPtrMove);
    document.addEventListener("pointerup", onPtrUp);
  };

  return (
    <div
      className={mainClass}
      style={{
        userSelect: "none",
        fontSize: '0.8em'
      }}
    >
      <header
        className={headerClass}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div ref={displayValue}>{value.current}</div>
      </header>
      <section
        className={rangeClass}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>{min}</span>
        <div
          ref={sliderRef}
          className={trackClass}
          style={{
            position: "relative",
            borderRadius: "3px",
            height: "5px",
            width: typeof trackWidth === "number"
              ? `${trackWidth}px`
              : trackWidth,
            backgroundColor: "#ddd",
          }}
        >
          <div
            ref={thumbRef}
            className={thumbClass}
            onPointerDown={onPtrDown}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              position: "relative",
              top: "-4px",
              cursor: "pointer",
              border: "solid thin grey",
              backgroundColor: 'inherit'
            }}
          />
        </div>
        <span>{max}</span>
      </section>
    </div>
  );
}
