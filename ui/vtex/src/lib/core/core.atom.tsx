export type DataType = 
	| "vertex" 
	| "node" 
	| 'axis2D'
	| 'function2D'
	| 'integral'
	| 'riemann'
	| 'plot'
	| 'tree'
	| "edge" 
	| 'leaf'
	| "graph";
export class Datum {
  type: DataType;
  constructor(type: DataType) {
    this.type = type;
  }
}
