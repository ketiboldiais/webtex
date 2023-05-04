import { CSTR } from "@/core/core.utils";

type AnyFunc = (...arg: any) => any;
type LastFnReturnType<F extends Array<AnyFunc>, Else = never> = F extends [
  ...any[],
  (...arg: any) => infer R,
] ? R
  : Else;
type PipeArgs<F extends AnyFunc[], Acc extends AnyFunc[] = []> = F extends [
  (...args: infer A) => infer B,
] ? [...Acc, (...args: A) => B]
  : F extends [(...args: infer A) => any, ...infer Tail]
    ? Tail extends [(arg: infer B) => any, ...any[]]
      ? PipeArgs<Tail, [...Acc, (...args: A) => B]>
    : Acc
  : Acc;

export function pipe<FirstFn extends AnyFunc, F extends AnyFunc[]>(
  arg: Parameters<FirstFn>[0],
  firstFn: FirstFn,
  ...fns: PipeArgs<F> extends F ? F : PipeArgs<F>
): LastFnReturnType<F, ReturnType<FirstFn>> {
  return (fns as AnyFunc[]).reduce((acc, fn) => fn(acc), firstFn(arg));
}
type UnaryFunction = (x: any) => any;

type Composable<Fn> = Fn extends readonly [UnaryFunction] ? Fn
  : Fn extends readonly [any, ...infer Rest extends readonly UnaryFunction[]]
    ? readonly [(arg: ComposeReturn<Rest>) => any, ...Composable<Rest>]
  : never;

type ComposeReturn<Fns extends readonly UnaryFunction[]> = ReturnType<Fns[0]>;

type ComposeParams<Fns> = Fns extends
  readonly [...any[], infer Last extends UnaryFunction] ? Parameters<Last>[0]
  : never;

export function compose<Fns extends readonly UnaryFunction[]>(
  ...fns: Composable<Fns>
) {
  return function (arg: ComposeParams<Fns>): ComposeReturn<Fns> {
    return fns.reduceRight((acc, cur) => cur(acc), arg) as ComposeReturn<Fns>;
  };
}

export enum sys {
  number,
  frac,
  scinum,
}
export function Typed<C extends CSTR>(base: C, type: sys) {
  return class extends base {
    getType() {
      return type;
    }
  };
}
