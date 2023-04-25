/* eslint-disable no-unused-vars */
import { ATOM } from "../atom.type";
import { Visitor } from "../visitor";
import { Text as VisXText } from "@visx/text";
import { ReactElement, useEffect, useState } from "react";
import KaTeX from "katex";
import { Group } from "..";

export class TEXT extends ATOM {
  Text: string;
  constructor(text: string) {
    super();
    this.Text = text;
  }
  getText() {
    const text = this.Text;
    return text;
  }
  accept<t>(visitor: Visitor<t>): t {
    return visitor.text(this);
  }
  At?: [number, number];
  at(x: number, y: number) {
    this.At = [x, y];
    return this;
  }
  getAt() {
    const out = this.At ? this.At : [0, 0];
    return out;
  }
  clone() {
    const text = this.Text;
    const isLatex = this.IsLatex;
    const out = new TEXT(text);
    out.IsLatex = isLatex;
    return out;
  }

  IsLatex: boolean = false;

  latex(text: string) {
    this.Text += text;
    this.IsLatex = true;
    return this;
  }
  getData(): $TEXT {
    const text = this.getText();
    const [x, y] = this.At || [0, 0];
    const id = this.id;
    const isLatex = this.IsLatex;
    return {
      text,
      x,
      y,
      id,
      isLatex,
    };
  }
}

export type $TEXT = {
  text: string;
  x: number;
  y: number;
  id: string;
  isLatex: boolean;
};

export const text = (text: string) => new TEXT(text);
export const latex = (text: string) => new TEXT("").latex(text);

export type _Text = {
  data: $TEXT;
};

export function Text({
  data,
}: _Text) {
  const x = data.x;
  const y = data.y;
  const text = data.text;
  if (data.isLatex) {
    return (
      <Group dx={x} dy={y}>
        <foreignObject width={1} height={1} overflow={"visible"}>
          <MathText content={text} />
        </foreignObject>
      </Group>
    );
  }
  return (
    <VisXText x={x} y={y} verticalAnchor={"start"} textAnchor={"start"}>
      {text}
    </VisXText>
  );
}

export const isText = (x: ATOM): x is TEXT => x instanceof TEXT;

type _MathText = {
  content: string;
};

type InnerHTML = { innerHtml: string } | { errorElement: ReactElement };
export function MathText({ content }: _MathText) {
  const [state, setState] = useState<InnerHTML>({ innerHtml: "" });
  useEffect(() => {
    try {
      const innerHtml = KaTeX.renderToString(content, {
        displayMode: true,
        throwOnError: false,
      });
      setState({ innerHtml });
    } catch (error) {
      if (error instanceof TypeError) {
        setState({ innerHtml: "error" });
      } else {
        throw error;
      }
    }
  }, []);

  if ("errorElement" in state) {
    return state.errorElement;
  }

  return (
    <div
      style={{ marginTop: "-1em" }}
      dangerouslySetInnerHTML={{ __html: state.innerHtml }}
    />
  );
}
