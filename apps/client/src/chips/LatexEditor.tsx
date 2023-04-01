import type { Ref, RefObject } from "react";
import { ChangeEvent, forwardRef } from "react";

import style from "../ui/styles/Latex.module.scss";

type LEP = {
  latex: string;
  inline: boolean;
  setLatex: (equation: string) => void;
};
type FRef = Ref<HTMLInputElement | HTMLTextAreaElement>;

function LatexEditor({ latex, setLatex, inline }: LEP, forwardedRef: FRef) {
  const onChange = (event: ChangeEvent) => {
    setLatex((event.target as HTMLInputElement).value);
  };
  return inline && forwardedRef instanceof HTMLInputElement
    ? (
      <span className={style.inputBackground}>
        <span className={style.dollar}>$</span>
        <input
          className={style.inlineEditor}
          value={latex}
          onChange={onChange}
          autoFocus={true}
          ref={forwardedRef as RefObject<HTMLInputElement>}
        />
        <span className={style.dollar}>$</span>
      </span>
    )
    : (
      <div className={style.inputBackground}>
        <span className={style.dollar}>{"$$\n"}</span>
        <textarea
          className={style.blockEditor}
          value={latex}
          onChange={onChange}
          ref={forwardedRef as RefObject<HTMLTextAreaElement>}
        />
        <span className={style.dollar}>{"\n$$"}</span>
      </div>
    );
}

export default forwardRef(LatexEditor);
