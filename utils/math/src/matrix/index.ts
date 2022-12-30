class Matrix {
  val:number[][];
  constructor(val?:number[][],public rows:number=3,public cols:number=3) {
    if (val) {
      this.val=val;
      this.cols=val.length;
      this.rows=val.reduce((p,c)=>p+c.length,0);
    } else {
      this.val=new Array(cols).map((v) => v.push(new Array(rows)));
			this.rows=rows;
			this.cols=cols;
    }
  }
  log() {
    console.log(this.val.reduce((p,c)=>p.concat('\n').concat(String(c)),''));
  }
}

export function matrix(val?: number[][], rows?: number, columns?: number) {
  return new Matrix(val, rows, columns);
}

