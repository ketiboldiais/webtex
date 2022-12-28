import { binTree } from '../src/';

const bt = binTree<{ id: number; val: string }>('val');
bt.push({ id: 2, val: 'dan' })
  .push({ id: 3, val: 'sam' })
  .push({ id: 1, val: 'amy' })
  .push({ id: 5, val: 'joe' })
  .push({ id: 2, val: 'dan' })
  .push({ id: 12, val: 'amy' });

console.log(bt.has({ id: 2, val: 'dan' }));
console.log(bt.height);
console.log(bt.array('in'));
bt.log();
