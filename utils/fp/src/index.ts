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
 * Calls each function passed as an argument.
 */
const hotline = <F extends Function>(...callbacks: F[]) =>
  callbacks.forEach((f) => f());

type Obj = { [key: string]: any };
type MintWorker<A, B, C> = (
  accumulatedValue: B,
  initialValue: A,
  shared: C & Obj
) => B;
type Mint = <A, B, C extends Obj>(
  workers: MintWorker<A, B, C>[],
  accumulatedValue: B,
  initialValue: A,
  shared: C
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
 *
 * @param accumulatedValue- The accumulated value.
 *
 * @param initialValue - The initial value.
 *
 * @param shared - An optional object to pass shared resources into.
 *
 * @typedef
 * ~~~
 * type Mint = <A,B>(workers: MintWorker<A,B>[], accumulatedValue:B, initialValue:A) => B
 * ~~~
 *
 * @typedef
 * ~~~
 * type MintWorker<A,B> = (accumulatedValue:B, initialValue: A) => B
 * ~~~
 *
 * @example
 * ~~~
 * const j = mint([
 *   (a,i,s) => {
 *     console.log(`(${a},${i}) s.x:${s.x}`) // (3,1) s.x: 14
 *     let x = a + 5
 *     s.w1 = x
 *     return x
 *   },
 *   (a,i,s) => {
 *     console.log(`(${a},${i}) s.y:${s.y}`); // (4,1) s.y: 9
 *     return a - 1
 *   },
 *   (a,i,s) => {
 *     console.log(`(${a},${i}) s.z:${s.z}`) // (5,1) s.z: 12
 *     console.log(`From worker 1: ${s.w1}`) // From worker 1: 8
 *     return a ** 2
 *  }], 3, 1, { x: 14, y: 9, z: 12 });
 * 
 * console.log(j) // 49
 * ~~~
 */
const mint: Mint = ([f, ...fs], acc, x, s = <any>{}) =>
  f === undefined ? acc : mint(fs, f(acc, x, s), x, s);

export { restruct, amendOne, hotline, mint };
