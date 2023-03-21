import { ast, ASTNode } from "./algom/ast/astnode.js";
import TeX from "@matejmazur/react-katex";
import { nanoid } from "@reduxjs/toolkit";
import { Counter } from "./Counter";
import { algom } from "./algom/index.js";
import { useState } from "react";
export function Calculator() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("");
  const [tree, setTree] = useState<ASTNode>(ast.nil);

  const updateExpr = (v: string) => {
    const newexpr = expr + v;
    setExpr(newexpr);
    const res = algom.toLatex(newexpr);
    const val = algom.parseExpr(newexpr);
    setDisplay(res);
    setTree(val);
  };

  const clearExpr = () => {
    setExpr("");
    setDisplay("");
    setTree(ast.nil);
  };

  const evalExpr = () => {
    const newexpr = algom.evalNode(tree);
    setExpr(newexpr);
    setDisplay(newexpr);
  };

  return (
    <div>
      <TeX math={display} />
      <div>
        <section>
          <div>
            <button onClick={() => updateExpr("1")}>{"1"}</button>
            <button onClick={() => updateExpr("2")}>{"2"}</button>
            <button onClick={() => updateExpr("3")}>{"3"}</button>
            <button onClick={() => updateExpr(" + ")}>{"+"}</button>
          </div>
          <div>
            <button onClick={() => updateExpr("4")}>{"4"}</button>
            <button onClick={() => updateExpr("5")}>{"5"}</button>
            <button onClick={() => updateExpr("6")}>{"6"}</button>
            <button onClick={() => updateExpr(" - ")}>{"-"}</button>
          </div>
          <div>
            <button onClick={() => updateExpr("7")}>{"7"}</button>
            <button onClick={() => updateExpr("8")}>{"8"}</button>
            <button onClick={() => updateExpr("9")}>{"9"}</button>
            <button onClick={() => updateExpr(" / ")}>{"/"}</button>
          </div>
          <div>
            <button onClick={() => updateExpr(".")}>{"."}</button>
            <button onClick={() => updateExpr("0")}>{"0"}</button>
            <button onClick={() => evalExpr()}>{"="}</button>
            <button onClick={() => updateExpr(" * ")}>{"×"}</button>
          </div>
        </section>
        <section>
          <button onClick={() => updateExpr("cos(")}>{"cos"}</button>
          <button onClick={() => updateExpr("tan(")}>{"tan"}</button>
          <button onClick={() => updateExpr("acos(")}>{"acos"}</button>
          <button onClick={() => updateExpr("acosh(")}>{"acosh"}</button>
          <button onClick={() => updateExpr("abs(")}>{"abs"}</button>
          <button onClick={() => updateExpr("sqrt(")}>
            <TeX math={"\\sqrt{x}"} />
          </button>
        </section>
        <section>
          <button onClick={() => clearExpr()}>CLEAR</button>
        </section>
      </div>
    </div>
  );
}
