/**
 * @param oldObject - The object as of now.
 * @param targetKey - The key whose value should be updated
 * @param newValue - The new value of the target key.
 */
const restruct = <T, K extends keyof T>(targetObject: T, update: [K, T[K]]) => {
  return Object.assign({}, targetObject, { [update[0]]: update[1] });
};

/**
 * @param array - An array of objects.
 * @param id - The object's unique identifier, mapped to the `id` property.
 * @param targetShape - A tuple [K,T[K]],
 * @param idKey -
 */
const amendOne = <
  YourObjectType,
  Key1 extends keyof YourObjectType,
  Key2 extends keyof YourObjectType
>(
  array: YourObjectType[],
  targetShape: [Key1, YourObjectType[Key1]],
  updateShape: [Key2, YourObjectType[Key2]]
) => {
  const updatedItems = array.map((item) => {
    item[targetShape[0]] !== targetShape[1] && item;
    if (item[targetShape[0]] !== targetShape[1]) {
      return item;
    }
    const updatedItem = restruct(item, updateShape);
    return updatedItem;
  });
  return updatedItems;
};

/**
 * Executes each function in its argument list, and returns
 * the results of each call as an array.
 * @param fs - The functions to execute
 * @example
 * ~~~
  let x = 4;
  const result = hotline(() => x+1, () => x-2, () => x+4)
  console.log(result) // [5,2,8]
 * ~~~
 */
const hotline = <F extends Function>(...fs: F[]) => fs.map((f) => f());

type Obj = { [key: string]: any };
type MintWorker<B, C> = (
  accumulatedValue: B,
  memo: C & Obj,
  index: number
) => B;
type Mint = <B, C extends Obj>(
  workers: MintWorker<B, C>[],
  accumulatedValue: B,
  memo?: C,
  index?: number
) => B;
/**
 * Accumulates a value by applying each callback function
 * in the `builders` array to the accumulated value.
 *
 * @param workers - The functions to apply at each accumulated value. Each
 * function is a callback of the form
 * ~~~
 * <A,B>(accumulatedValue: A, initialValue: B) => A
 * ~~~
 * @param accumulatedValue- The accumulated value.
 * @param memo - An optional object to pass shared resources into.
 * @param index - The index of the currently executing function
 * @typedef
 * ~~~
 * type Mint = <A,B>(workers: MintWorker<A,B>[], accumulatedValue:B, initialValue:A) => B
 * ~~~
 * @typedef
 * ~~~
 * type MintWorker<A,B> = (accumulatedValue:B, initialValue: A) => B
 * ~~~
 * @example
 * ~~~
  const j = mint([
    (a,s) => {
      console.log(`acc: ${a}`) // acc: 3
      let x = a + 1;
      s.w1 = x; // memoize
      return x;
    },
    (a,s,i) => {
      console.log(`acc: ${a}`) // acc: 3
      console.log(`s.x: ${s.x}`) // s.x: 2
      console.log(`i:${i}`) // i:2
      return a+2;
    },
    (a,s) => {
      console.log(`acc: ${a}`) // acc: 6
      console.log(`s.w1: ${s.w1}`) // s.w1:4
      return a+3;
    }
  ],3,{ x: 2 });

  console.log(j) // 9
 * ~~~
 */
const mint: Mint = ([f, ...fs], acc, memo: any) =>
  f === undefined ? acc : mint(fs, f(acc, memo, fs.length), memo);

/**
 * Generates an integer interval from `start` to `stop` inclusive.
 * @param start - The first integer.
 * @param stop - The last integer.
 * @param step - The increment value (how far apart each integer is from its left and right neighbor).
 * @example
 * ~~~
  const itv = interval(1,3);
  console.log(itv); // [1,2,3]
 * ~~~
 */
const ag = (start: number, stop: number, step: number, inc = 0) =>
  Array(Math.ceil((stop + inc - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

const interval = (start: number, stop: number, step = 1) =>
  ag(start, stop, step, 1);

/**
 * Generates an integer interval from `start` inclusive to `stop` exclusive.
 * @param start - The first integer.
 * @param stop - The last integer.
 * @param step - The increment value (how far apart each integer is from its left and right neighbor).
 * @example
 * ~~~
  const ivt = interval(0,3);
  console.log(ivt); // [0,1,2]
 * ~~~
 */
const range = (start: number, stop: number, step = 1) =>
  ag(start, stop, step, 0);

export { restruct, amendOne, hotline, mint, interval, range };
