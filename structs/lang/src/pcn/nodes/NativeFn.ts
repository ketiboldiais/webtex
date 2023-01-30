import { Node } from './index.js';

class NativeFn extends Node {
	constructor(args:Node[]) {
		super(args, 'native-fn')
	}
}
