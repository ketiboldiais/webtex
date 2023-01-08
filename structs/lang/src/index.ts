import { pipe } from 'fp-ts/lib/function.js';
import { within } from '@webtex/fp';

const print = console.log;
const char = (c: string) => c.charCodeAt(0);
const isLowerLatin = (c: string) => within(97)('<=')(char(c))('<=')(122);
const isUpperLatin = (c: string) => within(41)('<=')(char(c))('<=')(90);
const isDigit = (c: string) => within(30)('<=')(char(c))('<=')(57);
