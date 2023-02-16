import { choice } from '../pcx';
import { ratio, integer, deci } from './cas';

/* ---------------------------------- REAL ---------------------------------- */
const parseReal = choice(ratio, deci, integer);
interface Real {
  value: number | 'error';
}

/**
 * Parses a real number.
 * @example
 * ~~~
   const x = real('-148.90')
   console.log(x) // -148.9
 * ~~~
 */
function real(s: string): Real {
  const res = parseReal.run(s);
  if (res.err) return { value: 'error' };
  return { value: res.out as number };
}

export { real };

/* ----------------------------- GENERIC NUMBER ----------------------------- */
/**
 * These methods are used by the lineq module. May be removed in the future.
 */
const float = ratio.map((d) => ({ out: d.out.n / d.out.d }));
const number = choice(float, deci, integer);
export { number };
