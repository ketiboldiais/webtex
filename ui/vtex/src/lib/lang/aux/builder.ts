class ObjectBuilder {
  public static new<Target>(): IWith<Target, {}> {
    return new Builder<Target, {}>({});
  }
}

interface IWith<Target, Supplied> {
  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K],
  ): keyof Omit<Omit<Target, keyof Supplied>, K> extends never ? IBuild<Target>
    : IWith<Target, Supplied & Pick<T, K>>;
}

interface IBuild<Target> {
  build(): Target;
}

class Builder<Target, Supplied>
  implements IBuild<Target>, IWith<Target, Supplied> {
  constructor(private target: Partial<Target>) {}

  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K],
  ) {
    const target: Partial<Target> = { ...this.target, [key]: value };

    return new Builder<Target, Supplied & Pick<T, K>>(target);
  }

  build() {
    return this.target as Target;
  }
}
