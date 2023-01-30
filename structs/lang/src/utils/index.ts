// import treeify from 'npm:treeify';
import treeify from 'treeify';
export const { log } = console;
export const display = (x: any) => console.log(treeify.asTree(x, true, true));
//
