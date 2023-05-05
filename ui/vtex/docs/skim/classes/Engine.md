[@webtex/vtex](../README.md) / [Exports](../modules.md) / Engine

# Class: Engine

## Table of contents

### Constructors

- [constructor](Engine.md#constructor)

### Properties

- [Column](Engine.md#column)
- [Current](Engine.md#current)
- [CurrentToken](Engine.md#currenttoken)
- [Input](Engine.md#input)
- [LastToken](Engine.md#lasttoken)
- [Line](Engine.md#line)
- [Start](Engine.md#start)
- [Status](Engine.md#status)
- [peek](Engine.md#peek)

### Methods

- [NUMBER](Engine.md#number)
- [SIGN](Engine.md#sign)
- [STRING](Engine.md#string)
- [SYMBOL](Engine.md#symbol)
- [advance](Engine.md#advance)
- [atEnd](Engine.md#atend)
- [char](Engine.md#char)
- [enstate](Engine.md#enstate)
- [errorToken](Engine.md#errortoken)
- [expr](Engine.md#expr)
- [literal](Engine.md#literal)
- [match](Engine.md#match)
- [newToken](Engine.md#newtoken)
- [parse](Engine.md#parse)
- [position](Engine.md#position)
- [readNextToken](Engine.md#readnexttoken)
- [skipWhitespace](Engine.md#skipwhitespace)
- [symbolType](Engine.md#symboltype)
- [tick](Engine.md#tick)
- [tokenSlate](Engine.md#tokenslate)
- [tokenize](Engine.md#tokenize)
- [updateStatus](Engine.md#updatestatus)

## Constructors

### constructor

• **new Engine**()

## Properties

### Column

• `Private` **Column**: `number`

The current column number.

#### Defined in

skim.ts:2108

___

### Current

• `Private` **Current**: `number`

The starting index of the
current lexeme.

#### Defined in

skim.ts:2098

___

### CurrentToken

• `Private` **CurrentToken**: [`tkn`](../enums/tkn.md)

The current token.

#### Defined in

skim.ts:2085

___

### Input

• `Private` **Input**: `string`

The input source string.
This is a readonly string.
Modifications should never be made
on this source.

#### Defined in

skim.ts:2075

___

### LastToken

• `Private` **LastToken**: [`tkn`](../enums/tkn.md)

The last token read.

#### Defined in

skim.ts:2080

___

### Line

• `Private` **Line**: `number`

The current line number.

#### Defined in

skim.ts:2103

___

### Start

• `Private` **Start**: `number`

The starting index of the
current substring containing
a (potential) lexeme.

#### Defined in

skim.ts:2092

___

### Status

• `Private` **Status**: `status`

The current engine status.
See status from details on the
`stat` codes. The engine’s status
is never updated from a method directly.
All status updates should be made through
[updateStatus](Engine.md#updatestatus).

#### Defined in

skim.ts:2118

___

### peek

• **peek**: [`Token`](../modules.md#token) = `emptyToken`

#### Defined in

skim.ts:2451

## Methods

### NUMBER

▸ `Private` **NUMBER**(): [`Token`](../modules.md#token)

Scans a number. Supported number formats:
1. Hexadecimals of the form: `[0x] ([a-f]+ | [0-9]+)`,
2. Octals of the form `[0o] [0-7]+`,
3. Binary numbers of the form `[0b] [0|1]+ `,
4. Scientific numbers of the form `<decimal> e [+|-] <int>`
5. Fractions of the form `[+|-] <int> [/] <int>`
6. Integers (`<int>`) of the form `[0] | [1-9]+ [_] [0-9]+`

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2294

___

### SIGN

▸ `Private` **SIGN**(`of`): [`Token`](../modules.md#token)

Scanning method for handling `+` and `-`.
The tokens `+` and `-` are given special
treatment because we allow `+` and `-`
prefaced numbers.

#### Parameters

| Name | Type |
| :------ | :------ |
| `of` | ``"-"`` \| ``"+"`` |

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2221

___

### STRING

▸ `Private` **STRING**(): [`Token`](../modules.md#token)

Scans a string, if encountered.
This method is triggered when [readNextToken](Engine.md#readnexttoken)
encounters a double-quote. If no  terminating
double-quote is found, an error token
is returned.

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2271

___

### SYMBOL

▸ **SYMBOL**(): [`Token`](../modules.md#token)

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2367

___

### advance

▸ `Private` **advance**(): [`Token`](../modules.md#token)

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2452

___

### atEnd

▸ `Private` **atEnd**(): `boolean`

Returns true if the engine
has reached the end of input,
false otherwise.

#### Returns

`boolean`

#### Defined in

skim.ts:2177

___

### char

▸ `Private` **char**(): `string`

#### Returns

`string`

#### Defined in

skim.ts:2234

___

### enstate

▸ `Private` **enstate**(`src`): `void`

Initiates (and resets) the engine’s state.
This function should always be called at the
beginning of a parse, and called again at the
end of a parse.

#### Parameters

| Name | Type |
| :------ | :------ |
| `src` | `string` |

#### Returns

`void`

#### Defined in

skim.ts:2133

___

### errorToken

▸ `Private` **errorToken**(`message`): [`Token`](../modules.md#token)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2207

___

### expr

▸ **expr**(`minbp?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `minbp` | `bp` | `bp.non` |

#### Returns

`void`

#### Defined in

skim.ts:2464

___

### literal

▸ **literal**(): `void`

#### Returns

`void`

#### Defined in

skim.ts:2467

___

### match

▸ `Private` **match**(`expected`): `boolean`

A helper method that moves the state
forward (incrementing [Current](Engine.md#current))
if the next character matches `expected`. If
the character matches, returns `true`, otherwise
`false`. See [readNextToken](Engine.md#readnexttoken) for usage.

#### Parameters

| Name | Type |
| :------ | :------ |
| `expected` | `string` |

#### Returns

`boolean`

#### Defined in

skim.ts:2321

___

### newToken

▸ `Private` **newToken**(`t`, `lexeme?`): [`Token`](../modules.md#token)

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | [`tkn`](../enums/tkn.md) |
| `lexeme?` | `string` |

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2198

___

### parse

▸ **parse**(`src`): [`Token`](../modules.md#token)

#### Parameters

| Name | Type |
| :------ | :------ |
| `src` | `string` |

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2458

___

### position

▸ `Private` **position**(): readonly [`number`, `number`, `number`, `number`]

Returns a quad of numbers
`[start, current, line, column]`,
where:
- `start` is the [Start](Engine.md#start),
- `current` is the [Current](Engine.md#current),
- `line` is the [Line](Engine.md#line), and
- `column` is the [Column](Engine.md#column),

#### Returns

readonly [`number`, `number`, `number`, `number`]

#### Defined in

skim.ts:2164

___

### readNextToken

▸ `Private` **readNextToken**(): [`Token`](../modules.md#token)

Returns the next token recognized
in [Input](Engine.md#input). If the engine has
reached the end of input, it returns an error
Token of type `tkn.eof` (end-of-file token).
If no token is recognized and the Engine
hasn't reached the end of input, an error
token of type `tkn.error` is returned.

#### Returns

[`Token`](../modules.md#token)

#### Defined in

skim.ts:2383

___

### skipWhitespace

▸ `Private` **skipWhitespace**(): `void`

A helper method that skips
newlines, tabs, and whitespaces during scanning.
Currently used by [readNextToken](Engine.md#readnexttoken)

#### Returns

`void`

#### Defined in

skim.ts:2243

___

### symbolType

▸ **symbolType**(): [`symbol`](../enums/tkn.md#symbol) \| [`and`](../enums/tkn.md#and) \| [`class`](../enums/tkn.md#class) \| [`else`](../enums/tkn.md#else) \| [`for`](../enums/tkn.md#for) \| [`if`](../enums/tkn.md#if) \| [`null`](../enums/tkn.md#null) \| [`or`](../enums/tkn.md#or) \| [`nand`](../enums/tkn.md#nand) \| [`nor`](../enums/tkn.md#nor) \| [`xor`](../enums/tkn.md#xor) \| [`xnor`](../enums/tkn.md#xnor) \| [`not`](../enums/tkn.md#not) \| [`is`](../enums/tkn.md#is) \| [`return`](../enums/tkn.md#return) \| [`super`](../enums/tkn.md#super) \| [`this`](../enums/tkn.md#this) \| [`let`](../enums/tkn.md#let) \| [`def`](../enums/tkn.md#def) \| [`while`](../enums/tkn.md#while) \| [`in`](../enums/tkn.md#in) \| [`true`](../enums/tkn.md#true) \| [`false`](../enums/tkn.md#false) \| [`nan`](../enums/tkn.md#nan) \| [`inf`](../enums/tkn.md#inf) \| [`do`](../enums/tkn.md#do) \| [`goto`](../enums/tkn.md#goto) \| [`skip`](../enums/tkn.md#skip) \| [`to`](../enums/tkn.md#to) \| [`rem`](../enums/tkn.md#rem) \| [`mod`](../enums/tkn.md#mod) \| [`div`](../enums/tkn.md#div)

#### Returns

[`symbol`](../enums/tkn.md#symbol) \| [`and`](../enums/tkn.md#and) \| [`class`](../enums/tkn.md#class) \| [`else`](../enums/tkn.md#else) \| [`for`](../enums/tkn.md#for) \| [`if`](../enums/tkn.md#if) \| [`null`](../enums/tkn.md#null) \| [`or`](../enums/tkn.md#or) \| [`nand`](../enums/tkn.md#nand) \| [`nor`](../enums/tkn.md#nor) \| [`xor`](../enums/tkn.md#xor) \| [`xnor`](../enums/tkn.md#xnor) \| [`not`](../enums/tkn.md#not) \| [`is`](../enums/tkn.md#is) \| [`return`](../enums/tkn.md#return) \| [`super`](../enums/tkn.md#super) \| [`this`](../enums/tkn.md#this) \| [`let`](../enums/tkn.md#let) \| [`def`](../enums/tkn.md#def) \| [`while`](../enums/tkn.md#while) \| [`in`](../enums/tkn.md#in) \| [`true`](../enums/tkn.md#true) \| [`false`](../enums/tkn.md#false) \| [`nan`](../enums/tkn.md#nan) \| [`inf`](../enums/tkn.md#inf) \| [`do`](../enums/tkn.md#do) \| [`goto`](../enums/tkn.md#goto) \| [`skip`](../enums/tkn.md#skip) \| [`to`](../enums/tkn.md#to) \| [`rem`](../enums/tkn.md#rem) \| [`mod`](../enums/tkn.md#mod) \| [`div`](../enums/tkn.md#div)

#### Defined in

skim.ts:2327

___

### tick

▸ `Private` **tick**(`by?`): `string`

Increments the current
index by 1, and returns the
character before the increment.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `by` | `number` | `1` |

#### Returns

`string`

#### Defined in

skim.ts:2149

___

### tokenSlate

▸ `Private` **tokenSlate**(`lexeme?`): `Object`

Returns an object `{lexeme,line,column}`,
where:
- `lexeme` is the lexeme recognized,
- `line` is the [Line](Engine.md#line), and
- `column` is the [Column](Engine.md#column).
This is a helper method used by the
[newToken](Engine.md#newtoken) and
[errorToken](Engine.md#errortoken) methods
to produce tokens.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `lexeme` | `string` | `""` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `column` | `number` |
| `lexeme` | `string` |
| `line` | `number` |

#### Defined in

skim.ts:2192

___

### tokenize

▸ **tokenize**<`x`\>(`text`, `fn?`): `x`[]

Returns an array of tokens. This method
is used for testing, and isn’t directly
used by the Engine. It’s provided as
a part of the public API because it
may be helpful for debugging input
expressions.

#### Type parameters

| Name |
| :------ |
| `x` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `fn` | (`t`: [`Token`](../modules.md#token)) => `x` |

#### Returns

`x`[]

#### Defined in

skim.ts:2439

___

### updateStatus

▸ `Private` **updateStatus**(`newStatus`): `void`

Updates the current [Status](Engine.md#status).

#### Parameters

| Name | Type |
| :------ | :------ |
| `newStatus` | `status` |

#### Returns

`void`

#### Defined in

skim.ts:2123
