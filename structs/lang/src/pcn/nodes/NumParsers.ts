import {
  a,
  an,
  some,
  not,
  maybe,
  many,
  word,
  any,
  choice,
} from '../../pcx/index.js';
import { NumberType } from '../types.js';

const aMinusSign = a('-');
const aPoint = a('.');
const aZero = a('0');
const anE = an('E');
const aDigit = some('digit');
const aNegDigit = aMinusSign.and(aDigit).map((d) => ({ out: d.out.join('') }));
const aNonNegDigit = not(aMinusSign)
  .and(aDigit)
  .map((d) => ({ out: d.out.join('') }));

const pDigits = maybe(aNegDigit)
  .and(many(aNonNegDigit))
  .map<number[], string, string>((d) => ({
    out:
      d.out[0] === ''
        ? d.out
            .splice(1)
            .flat()
            .map((d) => Number(d))
        : d.out.flat().map((d) => Number(d)),
    type: 'digit',
  }));

const parseDigits = (s: string) => pDigits.parse<number[], 'digits'>(s);

const aNaturalNumber = word(not(aZero), any('digit'))
  .or(aZero)
  .map<string, string, NumberType>((d) => ({
    type: 'natural',
  }));

export const anInteger = word(maybe(aMinusSign), aNaturalNumber)
  .map<string, string, NumberType>((d) => ({
    out: d.out.flat().join(''),
    type: 'integer',
  }))
  .map<string, NumberType, NumberType>((d) => ({
    type: d.out.length >= 50 ? 'bigN' : 'integer',
  }));

const aDecimal = word(anInteger, aPoint, maybe(many(aZero)), aNaturalNumber)
  .map<string, string, NumberType>((d) => ({
    out: d.out.flat().join(''),
    type: 'real',
  }))
  .map<string, NumberType, NumberType>((d) => ({
    type: d.out.length >= 50 ? 'bigN' : 'integer',
  }));

const aScientificNumber = word(aDecimal.or(anInteger), anE, anInteger).map<
  string,
  string,
  NumberType
>((d) => ({
  out: d.out.flat().join(''),
  type:
    (d.out[0] as string).length >= 20 || (d.out[1] as string).length >= 15
      ? 'bigN'
      : 'scientific',
}));

export const makeScientific = (s: string) => {
  const p = aScientificNumber.map((d) => ({ out: d.out.split('E') }));
  return p.run(s).out.map((d) => Number(d)) as [number, number];
};

const aReal = choice(
  aScientificNumber,
  aDecimal,
  aNaturalNumber,
  anInteger
).map<string, NumberType, NumberType>((d) => ({
  out: d.out,
  type: d.type,
}));

const aRational = word(aReal, a('/'), aReal)
  .map<string, NumberType, NumberType>((d) => ({
    out: d.out.join(''),
  }))
  .map<string, NumberType, NumberType>((d) => {
    const res = d.out.split('/');
    if (res[0].length >= 15 || res[1].length >= 15) {
      return { type: 'bigN' };
    }
    return { type: 'rational' };
  });



export const makeRational = (s: string) => {
  const p = aRational.map((d) => ({
    out: d.out.split('/'),
  }));
  return p.run(s).out.map((d) => Number(d)) as [number, number];
};

const aNumber = choice(
  aRational,
  aScientificNumber,
  aDecimal,
  aNaturalNumber,
  anInteger
).map<string, NumberType, NumberType>((d) => ({
  out: d.out,
  type: d.type,
}));

export const parseNumber = (s: string) => aNumber.parse<string, NumberType>(s);
