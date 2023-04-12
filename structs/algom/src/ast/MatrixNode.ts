import { ToString } from "../visitors/ToString.js";
import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";
import { VectorNode } from "./VectorNode.js";

export class MatrixNode extends ASTNode {
  vectors: VectorNode[];
  rows: number;
  columns: number;
  matrix: ASTNode[][];
  constructor(vectors: VectorNode[], rows: number, columns: number) {
    super(NODE.MATRIX);
    this.vectors = vectors;
    this.rows = rows;
    this.columns = columns;
    this.matrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.matrix.push(this.vectors[i].elements);
    }
  }
  get val() {
    const vectors = `[${this.vectors.map((v) => v.val).join(", ")}]\n`;
    return `[${vectors}]`;
  }
  toString(n: ASTNode) {
    const ts = new ToString();
    return n.accept(ts);
  }
  accept<T>(node: Visitor<T>): T {
    return node.matrix(this);
  }
  clone() {
    let v: VectorNode[] = [];
    for (let i = 0; i < this.rows; i++) {
      v.push(this.vectors[i]);
    }
    return new MatrixNode(v, this.rows, this.columns);
  }
  forall(
    fn: (n: ASTNode, rowIndex: number, columnIndex: number) => any,
  ): any {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.matrix[i][j] = fn(this.matrix[i][j], i, j);
      }
    }
    return this.matrix;
  }
  map(fn: (n: ASTNode, rowIndex: number, columnIndex: number) => ASTNode) {
    let out = this.clone();
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        out.matrix[i][j] = fn(this.matrix[i][j], i, j);
      }
    }
    return out;
  }

  ith(i: number, j: number): ASTNode {
    return this.matrix[i][j];
  }
}
