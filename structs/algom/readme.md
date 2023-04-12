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
Algom was originally designed for evaluating mathematical expressions. That purpose remains at the forefront. Standard arithmetic operations are supported:

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

1. The identifier starts with an ASCII letter.
2. The identifier is not found in the [Token Table](#token-table).
3. The identifier is not found in the [Native Functions List](#native-functions-list).

A basic variable declaration followed by a function declaration:

~~~js
let n = 2;
let f(x) = x + 3;
let y = f(2) + n //  y = 7
~~~


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



## Native Functions List


## Scanner
The table that follows presents all the currently recognized tokens in Algom.

### Token List

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
