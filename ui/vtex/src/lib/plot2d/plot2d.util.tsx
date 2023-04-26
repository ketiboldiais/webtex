import { N2 } from "../types";

export function excluded(x: number,exclude: N2[]) {
	for(let i=0;i<exclude.length;i++) {
		const exclusion=exclude[i];
		const min=exclusion[0];
		const max=exclusion[1];
		if(min<=x&&x<=max) {
			return true;
		}
	}
	return false;
}