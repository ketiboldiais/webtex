import ctrl from "../ui/styles/control.module.scss";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { ColorPicker } from "./colorpicker.chip";
import { NumberInput } from "./Inputs";
import { Interval } from "./Interval";

type Ticker = {
  value: number;
  handler: (val: number) => void;
  label?: string|ReactNode;
};

type ColorSetter = {
  value: string;
  handler: (val: string) => void;
  label?: string|ReactNode;
};

type IntervalSetter = {
  value: [number, number];
  handler: (interval: [number, number]) => void;
  label?: string;
  minLabel?: string|ReactNode;
  maxLabel?: string|ReactNode;
};

interface ControlAPI {
  tickers?: Ticker[];
  colorPickers?: ColorSetter[];
  intervals?: IntervalSetter[];
  name: string;
  children?: ReactNode;
}

export default function CONTROL({
  children,
  name,
  tickers,
  colorPickers,
  intervals,
}: ControlAPI) {
  return (
    <div className={(ctrl.main + ' ' + name)}>
      {tickers &&
        (tickers.map((spec, i) => (
          <div className={ctrl.item} key={`${name}-ticker-${i}`}>
            {spec.label && <label>{spec.label}</label>}
            <NumberInput
              value={spec.value}
              onChange={spec.handler}
              className={ctrl.counter}
              noPropogate
            />
          </div>
        )))}
      {colorPickers &&
        (colorPickers.map((spec, i) => (
          <div
            key={`${name}-color${i}`}
            className={ctrl.item}
          >
            <ConditionalControl
              label={spec.label}
              value={spec.value}
              containerClass={ctrl.color_label}
              previewClass={ctrl.color_preview}
            >
              <ColorPicker color={spec.value} onChange={spec.handler} />
            </ConditionalControl>
          </div>
        )))}
      {intervals &&
        (intervals.map((spec, i) => (
          <div key={`${name}-interval${i}`} className={ctrl.item}>
            <Interval
              label={spec.label}
              value={spec.value}
              onChange={spec.handler}
              minLabel={spec.minLabel}
              maxLabel={spec.maxLabel}
              containerClass={ctrl.interval}
              inputLabelClass={ctrl.interval_input_label}
              counterClass={ctrl.interval_counters_wrapper}
            />
          </div>
        )))}
      {children}
    </div>
  );
}

type CondCtrl = {
  children: ReactNode;
  label?: string|ReactNode;
  value: string;
  containerClass: string;
  previewClass?: string;
};
function ConditionalControl({
  children,
  label,
  value,
  containerClass,
  previewClass = "",
}: CondCtrl) {
  const [show, setShow] = useState(false);
  return (
    <>
      <div
        className={containerClass}
        onClick={(event) => {
          event.stopPropagation();
          setShow(!show);
        }}
      >
        {label && <label>{label}</label>}
        <div
          className={previewClass}
          style={{ backgroundColor: value }}
        />
      </div>
      {show && createPortal(
        <div className={ctrl.modal}>
          <button
            className={ctrl.close_modal}
            onClick={() => setShow(false)}
          >
            &times;
          </button>
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
