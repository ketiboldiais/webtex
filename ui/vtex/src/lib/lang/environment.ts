export class Environment<T> {
  values: Map<string, T>;
  parent: Environment<T> | null;
  constructor(parent: Environment<T> | null = null) {
    this.values = new Map();
    this.parent = parent;
  }
  private clone() {
    const x = new Environment<T>();
    x.parent = this.parent;
    x.values = this.values;
    return x;
  }
  private ancestor(distance: number) {
    let env = this.clone();
    for (let i = 0; i < distance; i++) {
      env = env.parent!;
    }
    return env;
  }
  getAt(distance: number, name: string): T {
    return this.ancestor(distance).values.get(name)!;
  }
  assignAt(distance: number, name: string, value: T) {
    return this.ancestor(distance).values.set(name, value);
  }
  record(dict: Record<string, T>) {
    for (const key in dict) {
      if (!this.values.has(key)) {
        this.values.set(key, dict[key]);
      }
    }
    return this;
  }
  update(name: string, value: T): T {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return value;
    }
    if (this.parent !== null) {
      return this.parent.update(name, value);
    }
    const msg = `Variable ${name} is undeclared.`;
    throw new Error(msg);
  }
  write(name: string, value: T) {
    this.values.set(name, value);
    return value;
  }
  read(name: string): T {
    if (this.values.has(name)) {
      const out = this.values.get(name)!;
      return out;
    }
    if (this.parent !== null) {
      return this.parent.read(name);
    }
    const msg = `Undefined variable ${name}.`;
    throw new Error(msg);
  }
}

export const env = <T>(
  parent: Environment<T> | null = null,
) => new Environment<T>(parent);
