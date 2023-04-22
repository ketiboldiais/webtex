import {_Direction} from "../core/axis";
import { Struct, Visitor } from "../core/datum";

export type LineStyle = {
	width: number;
	color: string;
	dash: number;
}

export class Asymptote extends Struct {
	_direction: _Direction;
	_styles?: Partial<LineStyle>;
	_at: number = 0;
	constructor(type: _Direction) {
		super('Asymptote')
		this._direction = type;
	}
	at(value:number) {
		const self = this.getWritable();
		self._at = value;
		return self;
	}
	style(value:Partial<LineStyle>) {
		const self = this.getWritable();
		self._styles = value;
		return self;
	}
	accept<x>(visitor: Visitor<x>): void {
		visitor.asymptote(this);
	}
}
export type AsymptoteFactory = (dir: _Direction) => Asymptote;
export const asymptote = (dir:_Direction) => new Asymptote(dir);

