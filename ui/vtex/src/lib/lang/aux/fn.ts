
class Composition<A,B> {
	/**
	 * The `apply` property holds the 
	 * composition’s argument function.
	 * We mark it as readonly to ensure
	 * it isn’t written to, and private
	 * to ensure it isn’t exposed.
	 */
  private readonly apply: (x: A) => B;

	/**
	 * @param apply - The composition’s argument
	 * function.
	 */
  constructor(apply: (x: A) => B) {
    this.apply = apply;
  }
	
	/**
	 * Composes the argument function `f`
	 * with the current composition.
	 */
  and<C>(f: (x:C) => A): Composition<C,B> {
    return new Composition((x) => this.apply(f(x)));
  }
	
	/**
	 * Returns the composed function.
	 */
	end() {
		return this.apply;
	}
}

/**
 * Creates a new composition.
 */
const compose = <A,B>(f: (x:A)=>B) => new Composition(f);

class Pipe<A, B> {
		/**
	 * Like {@link Compose}, 
	 * the `apply` property holds the 
	 * pipe’s argument function.
	 * We mark it as readonly to ensure
	 * it isn’t written to, and private
	 * to ensure it isn’t exposed.
	 */
  private readonly apply: (x: A) => B;
  constructor(f: (x: A) => B) {
    this.apply = f;
  }
	/**
	 * Includes the argument function `g`
	 * to the function pipeline.
	 */
  to<C>(g: (x: B) => C) {
    return new Pipe((x: A) => g(this.apply(x)));
  }
	/**
	 * Returns the piped function.
	 */
	end() {
		return this.apply;
	}
}
const pipe = <A,B>(f:(x:A)=>B) => new Pipe(f);

