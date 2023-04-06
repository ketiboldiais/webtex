import { concat } from "src/util";
import app from "../ui/styles/App.module.scss";

export function BoldIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="m8.21 13c2.11 0 3.41-1.09 3.41-2.82 0-1.31-0.984-2.28-2.32-2.39v-0.055a2.18 2.18 0 0 0 1.85-2.14c0-1.51-1.16-2.46-3.01-2.46h-4.29v9.86h4.37zm-2.3-8.33h1.7c0.963 0 1.52 0.451 1.52 1.24 0 0.834-0.629 1.32-1.73 1.32h-1.48v-2.56zm0 6.79v-2.86h1.73c1.22 0 1.88 0.492 1.88 1.42 0 0.943-0.643 1.45-1.83 1.45h-1.78z" />
    </svg>
  );
}

export function StrikeIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z" />
    </svg>
  );
}

export function ItalicIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="m7.991 11.674 1.539-7.219c.123-.595.246-.71 1.347-.807l.11-.52h-3.776l-.11.52c1.06.096 1.128.212 1.005.807l-1.536 7.219c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />
    </svg>
  );
}

export function UnderlineIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="m5.313 3.136h-1.23v6.404c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623v-6.404h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57s-2.687-1.08-2.687-2.57zm7.187 11.864h-9v-1h9z" />
    </svg>
  );
}

export function LeftIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

export function CenterIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

export function RightIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

export function JustifyIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

export function WriteIcon() {
  return (
    <svg
      className={app.svgIcon}
      width="33.6"
      height="28"
      viewBox="0 0 215.4 179"
    >
      <g stroke="currentColor">
        <rect
          width="165.2"
          height="166.2"
          x="6.4"
          y="6.4"
          fill="none"
          strokeWidth="18.8"
          ry="11.5"
        />
        <g
          fill="currentColor"
          strokeWidth="6.4"
          transform="translate(-32 -27)"
        >
          <rect
            width="143.9"
            height="31.4"
            x="-161.4"
            y="-194.3"
            ry="5.7"
            transform="rotate(142)"
          />
          <path d="m117 117-8 26 26-3" />
        </g>
      </g>
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg className={app.svgIcon} viewBox="0 0 16 16">
      <path d="m8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1 -1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
    </svg>
  );
}

export function Plot1Icon() {
  return (
    <svg viewBox="0 0 32 32" className={app.svgIcon}>
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-65.145822 -81.020847)"
      >
        <path
          d="m68 111.00002s20.765222-3.4288 28-28.999999"
          stroke="currentColor"
          strokeWidth="2"
        />
        <g stroke="currentColor" strokeWidth="1.07907">
          <path d="m67 81.528642v30.471378" />
          <path d="m67 112.00002h29.425927" />
        </g>
      </g>
    </svg>
  );
}

export function ParametricIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 45.7 45.7"
      className={app.svgIcon}
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          d="M23 3v41"
        />
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          d="M0 21h45"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.9"
          d="M35 11c9 0 9 24 0 24-10 0-15-24-24-24-10 0-10 24 0 24 9 0 14-24 24-24z"
        />
      </g>
    </svg>
  );
}

export function Plot3DIcon() {
  return (
    <svg width="18" height="18" className={app.svg} viewBox="0 0 32 32">
      <g
        transform="matrix(.685 0 0 .685 -36.9 -50.3)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g stroke="currentColor" strokeWidth="1.43">
          <path d="m66.7 104-11.6 8.47" />
          <path d="m75.8 92.7v-16.5" />
          <path d="m85.2 105 14.1 5.82" />
        </g>
        <g stroke="currentColor" strokeWidth="2.35">
          <path d="m92.9 91.4-17.2 8.38-17.2-8.38 17.2-8.38z" />
          <path d="m75.8 99.8v16.8l17.2-8.38v-16.8" />
          <path d="m58.6 91.4v16.8l17.2 8.38" />
        </g>
      </g>
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 45.7 45.7"
      className={app.svgIcon}
    >
      <g stroke="inherit" strokeLinecap="round" strokeLinejoin="round">
        <path
          transform="scale(1.43)"
          d="m1.5 29.4v-1.19l5.74-8.62c3.16-4.74 5.77-8.61 5.81-8.61 0.0332 0.0031 1.78 2.37 3.87 5.26 3.33 4.6 3.84 5.26 4.08 5.26 0.208 0 0.673-0.407 2.12-1.85l1.85-1.85 5.53 7.37 0.0052 5.42h-29z"
          fill="inherit"
          strokeWidth=".482"
        />
        <g stroke="#828282">
          <rect
            x="1.43"
            y="1.43"
            width="42.9"
            height="42.9"
            fill="none"
            strokeWidth="1.25"
          />
          <path
            d="m1.43 40 17.1-25.7 11.4 15.7 5.71-5.71 8.57 11.4"
            fill="none"
          />
          <circle cx="33.6" cy="12.1" r="5" fill="inherit" strokeWidth="1.25" />
        </g>
      </g>
    </svg>
  );
}

export function EquationIcon() {
  return (
    <svg
      className={app.svgIcon}
      viewBox="0 0 32 32"
      stroke="currentColor"
    >
      <path
        d="m24 3h-20l11 13-11 13h20"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function DrawIcon() {
  return (
    <svg
      stroke="currentColor"
      className={app.svgIcon}
      viewBox="0 0 32 32"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g
        transform="matrix(-.858 .858 -.858 -.858 34.4 10.1)"
        strokeWidth="1.1"
      >
        <path d="m1 5h24" />
        <path d="m1 11h24" />
        <path d="m1 5v6" />
        <path d="m25 5 6 3-6 3" />
      </g>
      <path
        d="m24.4 1.28s5.15 1e-7 5.15 5.15"
        strokeWidth="1.33"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      className={app.svgIcon}
      width="800"
      height="800"
      viewBox="0 0 429.5 429.5"
    >
      <g fill="currentColor">
        <path d="M373 49h-80V8c0-4-3-8-8-8H142c-4 0-8 4-8 8v41H56c-4 0-8 3-8 8v364c0 5 4 8 8 8h317c5 0 8-3 8-8V57c0-5-3-8-8-8zM151 16h126v33H151V16zm214 397H64V101h301v312zm0-329H64V65h301v19z" />
        <path d="M285 388c5 0 8-4 8-8V136a8 8 0 1 0-16 0v244c0 4 4 8 8 8zm-143 0c5 0 9-4 9-8V136a8 8 0 0 0-17 0v244c0 4 4 8 8 8zm72 0c4 0 8-4 8-8V136a8 8 0 1 0-16 0v244c0 4 3 8 8 8z" />
      </g>
    </svg>
  );
}

type pCheckmark = {
  className?: string;
};
export function Checkmark({ className = "" }: pCheckmark) {
  return <div className={concat(app.checkmark, className)} />;
}

export function Chevron() {
  return <i className={concat(app.chevron, app.bottom)} />;
}
