# Algom

This is the repository for Algom, a small scripting
language. Originally designed as a computer algebra system for lecture examples, the module gradually increased in complexity, eventually acquiring its current formal grammar and various subcomponents:

1. A scanner for tokenizing strings;
2. A parser for constructing its abstract syntax trees;
3. A typechecker to ensure compliance with a defined type-system; and
4. A compiler that outputs executable JavaScript functions.

## Primitive Types
Algom operates on the following primitives:

1. `boolean` - The values `true` or `false`.
2. `null` - The value `null`.
3. `symbol` - An immutable reference.
4. `string` - A string value.
5. `int` - An integer.
	- Integers have the following subtypes:
		- `hexadecimal` - an integer in base-16. E.g., `0xabc`. 
		- `binary` - an integer in base-2. E.g., `0b1101`.
		- `octal` - an integer in base-8. E.g., `0o123`.
6. `fraction` - A fractional number.
7. `float` - floating point number.
8. `scinum` - scientific number.
9. `complex` - A complex number.
2. `NaN` - A numeric type for floating-point overflow or mathematically undefined operations.
2. `inf` - A numeric type symbolizing ${\infty.}$

## Basic Arithmetic
Algom was originally designed for evaluating mathematical expressions, and that purpose remains at the forefront. Standard arithmetic operations are supported:

~~~js
1 + 1 = 2;

3 - 2 = 1;

2 * 2 = 4;

3^2 = 9;

-13 % 64 = -13

-13 rem 64 = 51

5 div 2 = 2

2 / 4 = 0.5;

2/4 = 1/2;

~~~

Observations:

1. Algom is semicolon-delimited.
2. On the final line, `2/4 = 1/2`, whereas `2 / 4 = 0.5`. To provide greater control over floating point arithmetic and round-off errors, Algom treats expressions such as `2/4` as fractions, reducing them to floating point numbers only when specifically instructed. This ensures that expressions such as `pi/2 + pi/2` evaluate to a symbolic `pi`, rather than the floating point value of `pi`. 
3. Algom distinguishes between the `%` operator and the `rem` operator. The `%` operator works as expected in a language like JavaScript. The `rem` operator follows the mathematical definition of the remainder operator (in some texts, the `mod` operator).
4. The `div` operator returns the integer quotient of a divison. This is equivalent to ${\lfloor{ x/y \rfloor},}$ where ${x, y \in \Z.}$

### Precedence Rules
The Algom compiler uses Pratt parser to enforce a defined precedence scheme. The Pratt parser operates by comparing the binding power of each scanned token (in the parser’s source code, the token property `bp`). A binding power is an element of the following ordered poset (listed from least to greatest):

1. `NIL`
2. `NON`
3. `LOW`
4. `LMID` (“low middle”)
5. `MID` (“middle”)
6. `UMID` (“upper middle”)
7. `HIGH`
8. `TOP`
9. `PEAK`
10. `APEX`

Each binding power is assigned to a defined subset of operators:

1. `NIL` is indicates a utility token type (e.g., `EOF` or `ERROR`). If the Pratt parser is given a `NIL` power, parsing immediately halts.
2. `NON`. A base-case power. Because Pratt parsing is a recursive operation, this serves as a base case, allowing other parsers to operate on potential sub-expressions.
3. Equality and equivalence operators have a precedence of `LOW`.
4. Inequality operators have a precendence of `LMID`.
5. Binary additive operators (`+` and `-`) have a precence of `MID`.
6. Binary multiplicative operators (`*`, `/`, `%`) have a precedence of `UMID`.
7. Exponentiation and remainder operators (`^` and `rem`) have a predence of `HIGH`.
8. Prefix operators (function calls, mathematical and logical negation) have a precence of `TOP`.
9. Postfix operators (factorial `!` and derivative `'`) have a precence of `PEAK`.
10. Function calls have a precedence of `APEX`. 


## Variables and Function Declaration
Variables and functions in Algom are both declared with the `let` keyword. Both variables and functions must be valid identifiers. Currently, Algom only supports ASCII characters for identifiers. An identifier is considered valid if it meets the following criteria:

1. The identifier starts with an ASCII letter, an underscore (`_`), and ends with an underscore (`_`) or digit.
2. The identifier is not a [defined token](#defined-token).
3. The identifier is not a [native constant](#native-constants).
4. The identifier is not a [native function](#native-functions).

A basic variable declaration followed by a function declaration:

~~~js
let n = 2;
let f(x) = x + 3;
let y = f(2) + n //  y = 7
~~~

The following rules apply to both function and variable declarations;

1. Algom has no concept of hoisting. All variables and functions must be declared before use.
2. Once declared in a given scope, the variable cannot be declared again.
3. Variables and functions used before or without declaration return the error type `RESOLVER_ERROR`.

## Scope
Algom is a lexically-scoped language, and its scoping rules are statically-defined. When a variable is referenced in
an expression, its identifier is resolved through the innermost scope that encloses the expression. For example:

~~~js
let g(a) = {
	let n = 4;
	let f(x) = {
		let n = 5;
		return x + n;
	}
} 

~~~

Above, the identifier `n` is resolved within the scope of `f`, yielding the value `5`. If, however, the code were:

~~~js
let g(a) = {
	let n = 4;
	let f(x) = {
		return x + n;
	}
} 
~~~

the identifier `n` would resolve to `4`, since innermost scope is `g.` We say that the variable `n` in `f` _shadows_ the `n` of `g`. In general, it is best to avoid shadowing whenever possible to maintain code readability.


## Implicit Multiplication
Algom supports certain forms of implicit multiplication.

~~~js
let y = 2(2); // y = 4

let f(x) = 2x;
f(3); // 6

let g(a) = 2(a - 1);
g(5) // 2(5-1) = 8

let z(p) = p(2 - 5);
z(8) // 8(2 - 5) = 8(-3) = -24
~~~



## Native Functions
Algom provides several functions natively. Because native function names are immediately tokenized as `CALL` during the scanning stage, the following names will not be recognized as identifiers. 

### Trigonometric Functions
| Function | Returns                               | Example                 |
| -------- | ------------------------------------- | ----------------------- |
| `abs`    | The absolute value of `x`.            | `abs(-5) = 5`           |
| `acos`   | The inverse cosine of `x` in radians. | `acos(8,10) = 0.643...` |
| `acosh`  | The inverse hyperbolic cosine of `x`  | `acosh(1) = 0`          |
| `asin`   | The inverse sine of `x` in radians.   | `asin(6,10) = 0.643...` |
| `asinh`  | The inverse hyperbolic sine of `x`    | `asinh(0) = 0`          |
| `atan`   | The inverse tangent of `x`            | `atan(8,10) = 0.674...` |
| `atan2`  | The inverse-tangent-squared of `x`    | `atan2(5,5) = 45`       |
| `atanh`  | The inverse hyperbolic tangent of `x` | `atanh(-1) = -inf`      |
| `cbrt`   | The cubic root of `x`                 | `cbrt(64) = 4`          |
| `cos`    | The cosine of `x` in radians          | `cos(0) = 1`            |
| `cosh`   | The hyperbolic cosine of `x`          | `cosh(1) = 1.543..`     |
| `hypot`  | The square root of `x^2 + y^2`        | `hypot(3,4) = 5`        |

### Arithmetic Functions
| Function | Returns                                                     | Example                              |
| -------- | ----------------------------------------------------------- | ------------------------------------ |
| `ceil`   | The ceiling of `x`                                          | `ceil(7.1) = 8`, `ceil(-7.1) = -7`   |
| `floor`  | The floor of `x`                                            | `floor(5.2) = 5`, `floor(-5.2) = -6` |
| `fround` | The rounding of `x` to its nearest 32-bit single precision. | `fround(5.05) = 5.0500001909734864`  |
| `round`  | Rounds `x` to the _nearest_ integer                         | `round(0.9) = 1`                     |
| `sqrt`   | Returns the square root of `x`                              | `sqrt(4) = 2`                        |
| `sign`   | Returns `-1` if `x < 0`, `0` if `x = 0`, or `1` if `x > 1`  | `sign(-0.2) = -1`                    |

### Logarithmic Functions
| Function | Returns                  | Example                 |
| -------- | ------------------------ | ----------------------- |
| `ln`     | The natural log of `x`   | `ln(1) = 0.69314718056` |
| `log`    | The ${\log_{10}}$ of `x` | `log(100000) = 5`       |
| `lg`     | The ${\log_{2}}$ of `x`  | `lg(2) = 1`             |


### Transcendental Functions
| Function | Returns                             | Example             |
| -------- | ----------------------------------- | ------------------- |
| `exp`    | `E^x`, where `E` is Euler's number. | `exp(1) = 2.718...` |

### Relational Functions
| Function | Returns                                                                                                                         | Example                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `max`    | Given a list of numbers, the maximum number.                                                                                    | `max(3,1,2) = 3`         |
| `min`    | Given a list of numbers, the minimum number.                                                                                    | `min(3,1,2) = 1`         |
| `avg`    | Given a list of numbers, the arithmetic mean.                                                                                   | `avg(1,2,3) = 3`         |
| `sum`    | Given a list of numbers, the sum given each number.                                                                             | `sum(1,2,3) = 6`         |
| `range`  | Given a starting number `a`, an ending number `b`, and a step `c`, an array of numbers from a `a` to `b - c`, separated by `c`. | `range(0,3,1) = [0,1,2]` |
| `even`   | Given an integer `x`, returns `1` if `x` is even, `0` otherwise.                                                                | `even(8) = true`         |
| `odd`    | Given an integer `x`, returns `1` if `x` is odd, `0` otherwise.                                                                 | `odd(3) = true`          |


### Volatile Functions
| Function  | Returns                                                                                                           | Example                       |
| --------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `rand`    | Taking no arguments, a pseudo-random floatng point number between `0` and `1`.                                    | `rand() = 0.3988801583859237` |
| `randInt` | Given a minimum number `a` and a maximum number `b`, a random integer between `a` and `b`, `a` and `b` inclusive. | `randInt(1,8) = 7`            |




## Native Constants
Algom provides the following constants natively. Because the following lexems are immediately tokenized as constant numbers, they cannot be used as identifiers.

| Constant | Morpheme                            |
| -------- | ----------------------------------- |
| `E`      | Euler’s constant, ${e.}$            |
| `PI`     | The constant ${\pi.}$               |
| `LN2`    | The natural log of 2.               |
| `LN10`   | The natural log of 10.              |
| `SQRT2`  | The square root of 2 (${\sqrt{2}}$) |


## Conditionals
Conditional expressions in Algom follow standard syntax:

~~~js
let x = 2;
if (x < 3) {
	x = x + 1;
}
let y = x + 3; // y = 6
if (y < 4) {
	y = y + 2;
} else {
	y = y + 1; // y = 7
}
~~~

## Loops
Like most languages, there are two ways to write loops in Algom, the for-loop:

~~~js
let x = 5;
for (let i = 0; i < 3; i++) {
	x = x + i;
}
let a = x + 1; // a = 9
~~~

and the while-loop:

~~~js
let i = 5;
while (i > 2) {
	i = i - 1;
}
let n = i + 8; // n = 10
~~~


## Defined Token

| Token       | Lexeme                                                      |
| ----------- | ----------------------------------------------------------- |
| `EOF`       | End of file/input.                                          |
| `ERROR`     | Error during scanning.                                      |
| `NIL`       | Empty token, indicating the expectation of a non-nil token. |
| `COMMA`     | Delimiter `,`                                               |
| `QUERY`     | Delimiter `?`                                               |
| `LPAREN`    | Delimiter `(`                                               |
| `RPAREN`    | Delimiter `)`                                               |
| `LBRACKET`  | Delimiter `[`                                               |
| `RBRACKET`  | Delimiter `]`                                               |
| `LBRACE`    | Delimiter `{`                                               |
| `RBRACE`    | Delimiter `}`                                               |
| `DQUOTE`    | Delimiter `"`                                               |
| `SEMICOLON` | Delimiter `;`                                               |
| `COLON`     | Delimiter `:`                                               |
| `VBAR`      | Delimiter `|`                                               |
| `DOT`       | Operator `.`                                                |
| `PLUS`      | Operator `+`                                                |
| `PLUS_PLUS` | Operator `++`                                               |
| `SQUOTE`    | Operator `'`                                                |
| `MINUS`     | Operator `-`                                                |
| `STAR`      | Operator `*`                                                |
| `SLASH`     | Operator `/`                                                |
| `PERCENT`   | Operator `%`                                                |
| `CARET`     | Operator `^`                                                |
| `BANG`      | Operator `!`                                                |
| `MOD`       | Operator `mod`                                              |
| `DIV`       | Operator `div`                                              |
| `REM`       | Operator `rem`                                              |
| `TO`        | Operator `to`                                               |
| `DEQUAL`    | Operator `==`                                               |
| `NEQ`       | Operator `!=`                                               |
| `LT`        | Operator `<`                                                |
| `GT`        | Operator `>`                                                |
| `GTE`       | Operator `>=`                                               |
| `LTE`       | Operator `<=`                                               |
| `TILDE`     | Operator `~`                                                |
| `ASSIGN`    | Operator `=`                                                |
| `AMP`       | Operator `&`                                                |
| `LSHIFT`    | Operator `<<`                                               |
| `RSHIFT`    | Operator `>>`                                               |
| `NEGATE`    | Operator `-`                                                |
| `IN`        | Operator `in`                                               |
| `NOT`       | Operator `not`                                              |
| `OR`        | Operator `or`                                               |
| `NOR`       | Operator `nor`                                              |
| `XOR`       | Operator `xor`                                              |
| `XNOR`      | Operator `xnor`                                             |
| `AND`       | Operator `and`                                              |
| `NAND`      | Operator `nand`                                             |
| `THROW`     | Keyword `throw`                                             |
| `IF`        | Keyword `if`                                                |
| `ELSE`      | Keyword `else`                                              |
| `FOR`       | Keyword `for`                                               |
| `FUNCTION`  | Keyword `function`                                          |
| `RETURN`    | Keyword `return`                                            |
| `THIS`      | Keyword `this`                                              |
| `WHILE`     | Keyword `while`                                             |
| `DO`        | Keyword `do`                                                |
| `LET`       | Keyword `let`                                               |
| `CONST`     | Keyword `const`                                             |
| `FALSE`     | Value `false`                                               |
| `TRUE`      | Value `true`                                                |
| `INF`       | Value `inf`                                                 |
| `NAN`       | Value `NaN`                                                 |
| `NULL`      | Value `null`                                                |
| `SYMBOL`    | Non-evaluable token                                         |
| `STRING`    | String value                                                |
| `INT`       | Integer                                                     |
| `FRAC`      | Rational number                                             |
| `FLOAT`     | Floating point number                                       |
| `HEX`       | Hexadecimal number                                          |
| `BINARY`    | Binary number                                               |
| `OCTAL`     | Octal number                                                |
| `SCINUM`    | Scientific number                                           |
| `COMPLEX`   | Complex number                                              |
| `CALL`      | Operator, indicates a keyword mapping to a native function  |
