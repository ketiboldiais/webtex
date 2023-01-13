import { curry } from 'fnts';
import { Either as either } from 'fp-ts/lib/Either.js';

const { log: show } = console;

const _sum3 = (a: number, b: number, c: number): number => a + b + c;
const sum3 = curry(_sum3);

const x = sum3(1)(2)(3);

export { show };
