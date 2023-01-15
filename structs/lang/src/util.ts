import type { State } from './index.js';

export class make {
  public static new<Target>(): With<Target, {}> {
    return new Builder<Target, {}>({});
  }
}

export interface With<Target, Supplied> {
  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K]
  ): keyof Omit<Omit<Target, keyof Supplied>, K> extends never
    ? Build<Target>
    : With<Target, Supplied & Pick<T, K>>;
}

export interface Build<Target> {
  build(): Target;
}

export class Builder<Target, Supplied>
  implements Build<Target>, With<Target, Supplied>
{
  constructor(private target: Partial<Target>) {}
  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K]
  ) {
    const target: Partial<Target> = { ...this.target, [key]: value };
    return new Builder<Target, Supplied & Pick<T, K>>(target);
  }
  build() {
    return this.target as Target;
  }
}

export const output = <T>(out: T) => make.new<State<T>>().with('out', out);

