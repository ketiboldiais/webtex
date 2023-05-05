[@webtex/vtex](README.md) / Exports

# @webtex/vtex

## Table of contents

### Enumerations

- [tkn](enums/tkn.md)

### Classes

- [Engine](classes/Engine.md)
- [P](classes/P.md)

### Type Aliases

- [SkimRule](modules.md#skimrule)
- [SkimState](modules.md#skimstate)
- [Token](modules.md#token)

### Functions

- [add](modules.md#add)
- [amid](modules.md#amid)
- [among](modules.md#among)
- [any](modules.md#any)
- [ceil](modules.md#ceil)
- [chain](modules.md#chain)
- [difl](modules.md#difl)
- [difr](modules.md#difr)
- [div](modules.md#div)
- [equal](modules.md#equal)
- [erratum](modules.md#erratum)
- [even](modules.md#even)
- [flaw](modules.md#flaw)
- [floor](modules.md#floor)
- [gt](modules.md#gt)
- [gte](modules.md#gte)
- [initSkim](modules.md#initskim)
- [list](modules.md#list)
- [lt](modules.md#lt)
- [lte](modules.md#lte)
- [many](modules.md#many)
- [maybe](modules.md#maybe)
- [minus](modules.md#minus)
- [mod](modules.md#mod)
- [neq](modules.md#neq)
- [number](modules.md#number)
- [odd](modules.md#odd)
- [one](modules.md#one)
- [pow](modules.md#pow)
- [product](modules.md#product)
- [quot](modules.md#quot)
- [regex](modules.md#regex)
- [rem](modules.md#rem)
- [root](modules.md#root)
- [sepby](modules.md#sepby)
- [skip](modules.md#skip)
- [some](modules.md#some)
- [success](modules.md#success)
- [sum](modules.md#sum)
- [times](modules.md#times)
- [word](modules.md#word)

## Type Aliases

### SkimRule

Ƭ **SkimRule**<`T`\>: (`state`: [`SkimState`](modules.md#skimstate)<`any`\>) => [`SkimState`](modules.md#skimstate)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`state`): [`SkimState`](modules.md#skimstate)<`T`\>

All SkimRules are functions that take a SkimState and return
a SkimState.

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`SkimState`](modules.md#skimstate)<`any`\> |

##### Returns

[`SkimState`](modules.md#skimstate)<`T`\>

#### Defined in

skim.ts:144

___

### SkimState

Ƭ **SkimState**<`T`\>: `Object`

Every skimmer returns a skim state.
If a result is `null` or `undefined` or an `empty-string`,
the next skimmer will disregard that result.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `erred` | `boolean` | - |
| `error?` | `string` | An error message, defaults to undefined. If this property is set, then the next skimmer knows that the previous state was in error. |
| `index` | `number` | The state’s current index marks the start of the pattern for the next skimmer. Every skimmer counts on the previous skimmer to correctly mark this index. If a state is in error, it should not update the state’s index, because the next skimmer might successfully match the pattern starting at that index. |
| `result` | `T` | The result the skimmer returns if a successful match is found. If a core skimmer errs, it returns a result of `null`, `undefined`, or the empty-string `""`. The field is kept generic, however, because the user might want to change this result on a successful skim. Because this field is generic, skimmers _should never_ rely on the result of a previous skimmer. In fact, the `result` field has nothing to do with a skimmer. It is simply here as a box for side-effects to live in. |
| `text` | `string` | The input string. This is a read-only string, and it should _NEVER_ be modified. |

#### Defined in

skim.ts:35

___

### Token

Ƭ **Token**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `column` | `number` |
| `lexeme` | `string` |
| `line` | `number` |
| `type` | [`tkn`](enums/tkn.md) |

#### Defined in

skim.ts:1859

## Functions

### add

▸ **add**(`x`, `y`): `number`

Computes the sum of two numbers, `x`
and `y`. This function has an arity of 2.
For an n-ary sum, see [sum](modules.md#sum).

**`Example`**

```ts
~~~
const x = add(1,2) // 3
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:11](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L11)

___

### amid

▸ **amid**<`A`, `B`\>(`left`, `right`): <C\>(`content`: [`P`](classes/P.md)<`C`\>) => [`P`](classes/P.md)<``null`` \| `NonNullable`<`A`\> \| `NonNullable`<`B`\> \| `NonNullable`<`C`\>\>

Skims the content between two skimmers, `P<A>` and `P<B>`.
If no match is found, returns a `null` result. Otherwise,
returns the result of `P<C>`, the content skimmer. Useful
for skimming delimited content.

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `left` | [`P`](classes/P.md)<`A`\> | The left delimiter. E.g., `(`. |
| `right` | [`P`](classes/P.md)<`B`\> | The right delimiter. E.g., `)`. |

#### Returns

`fn`

A function that takes a skimmer as an argument.

▸ <`C`\>(`content`): [`P`](classes/P.md)<``null`` \| `NonNullable`<`A`\> \| `NonNullable`<`B`\> \| `NonNullable`<`C`\>\>

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `content` | [`P`](classes/P.md)<`C`\> |

##### Returns

[`P`](classes/P.md)<``null`` \| `NonNullable`<`A`\> \| `NonNullable`<`B`\> \| `NonNullable`<`C`\>\>

#### Defined in

skim.ts:645

___

### among

▸ **among**(`rules`): [`P`](classes/P.md)<`string`\>

Given the set of strings or numbers, returns
the first successful match.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rules` | (`string` \| `number`)[] |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:723

___

### any

▸ **any**(): [`P`](classes/P.md)<`any`\>

Returns a skimmer that matches
any given character.

#### Returns

[`P`](classes/P.md)<`any`\>

#### Defined in

skim.ts:623

___

### ceil

▸ **ceil**(`x`): `number`

Returns the ceiling of `x`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:266](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L266)

___

### chain

▸ **chain**<`T`, `A`\>(`rules`): [`P`](classes/P.md)<``null`` \| `T`\>

Returns a skimmer that must match the given list of rules
exactly. If a single skimmer fails, an error is returned.
This is in contrast to the `list` skimmer, which always
succeeds.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `any`[] |
| `A` | extends [`P`](classes/P.md)<[...T[]][`number`]\>[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rules` | [...A[]] | A list of rules to match. |

#### Returns

[`P`](classes/P.md)<``null`` \| `T`\>

#### Defined in

skim.ts:478

___

### difl

▸ **difl**(`...terms`): `number`

Computes the left-difference of the given terms
(`difl` is short for “difference left”). Given
terms:
~~~
(x₁, x₂, ..., xₙ)
~~~
returns
~~~
x₁ - x₂ - ... - xₙ
~~~
Note that subtraction is a non-commutative
operation: `a - b ≠ b - a`. Term ordering
matters. An accompanying right difference
method can be found in [difr](modules.md#difr).

**`Example`**

```ts
~~~
const x = difl(5,4,3,2,1); // -5
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `...terms` | `number`[] |

#### Returns

`number`

#### Defined in

[core/count.ts:60](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L60)

___

### difr

▸ **difr**(`...terms`): `number`

Computes the right-difference of the given terms
(`difr` is short for “difference right”). Given
terms:
~~~
(x₁, x₂, ..., xₙ)
~~~
returns
~~~
xₙ - xₙ₋₁ - ... - x₁
~~~
Note that subtraction is a non-commutative
operation: `a - b ≠ b - a`. Term ordering
matters. An accompanying right difference
method can be found in [difl](modules.md#difl).

**`Example`**

```ts
~~~
const x = difr(5,4,3,2,1); // -13
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `...terms` | `number`[] |

#### Returns

`number`

#### Defined in

[core/count.ts:89](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L89)

___

### div

▸ **div**(`x`, `y`): `number`

Computes the divison of two numbers.

**`Example`**

```ts
~~~
const x = div(1,2) // 0.5
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:153](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L153)

___

### equal

▸ **equal**(`x`, `y`): `boolean`

Returns true if the two supplied arguments are
equal, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:206](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L206)

___

### erratum

▸ **erratum**(`parserName`, `message`): `string`

Utility function to standardize error messages.

#### Parameters

| Name | Type |
| :------ | :------ |
| `parserName` | `string` |
| `message` | `string` |

#### Returns

`string`

#### Defined in

skim.ts:135

___

### even

▸ **even**(`x`): `boolean`

Returns true if `x` is even, false otherwise.

**`Example`**

```ts
~~~
const a = even(2) // true
const b = even(3) // false
const c = even(0) // true
const d = even(3.5) // false
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:244](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L244)

___

### flaw

▸ **flaw**<`A`\>(`prev`, `error`): [`SkimState`](modules.md#skimstate)<`any`\>

Creates a new error state.

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prev` | [`SkimState`](modules.md#skimstate)<`A`\> | The previous skim state. |
| `error` | `string` | An error message. |

#### Returns

[`SkimState`](modules.md#skimstate)<`any`\>

#### Defined in

skim.ts:119

___

### floor

▸ **floor**(`x`): `number`

Returns the floor of `x`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:261](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L261)

___

### gt

▸ **gt**(`x`, `y`): `boolean`

Returns true if `x > y`, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:222](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L222)

___

### gte

▸ **gte**(`x`, `y`): `boolean`

Returns true if `x >= y`, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:232](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L232)

___

### initSkim

▸ **initSkim**(`text`): [`SkimState`](modules.md#skimstate)<`any`\>

Creates a new initial state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | The input source. |

#### Returns

[`SkimState`](modules.md#skimstate)<`any`\>

#### Defined in

skim.ts:87

___

### list

▸ **list**<`T`, `A`\>(`rules`): [`P`](classes/P.md)<`A` extends [`P`](classes/P.md)<`T`\>[] ? `T` : `never`[]\>

Returns a skimmer that matches the given list of rules.
The skimmer will hold either an array of results from
the rules successfully matched. If no rule is matched,
returns an empty array. Note that `list` skimmers never fail.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `any`[] |
| `A` | extends [`P`](classes/P.md)<[...T[]][`number`]\>[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rules` | [...A[]] | A list of rules to match. |

#### Returns

[`P`](classes/P.md)<`A` extends [`P`](classes/P.md)<`T`\>[] ? `T` : `never`[]\>

#### Defined in

skim.ts:509

___

### lt

▸ **lt**(`x`, `y`): `boolean`

Returns true if `x < y`, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:217](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L217)

___

### lte

▸ **lte**(`x`, `y`): `boolean`

Returns true if `x <= y`, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:227](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L227)

___

### many

▸ **many**<`T`\>(`rule`): [`P`](classes/P.md)<`T`[]\>

Returns a skimmer that matches the given rule as
many times as possible, ceasing at the first failed rule.
The skimmer will hold either an array of results from
the successful matches, or an empty array.
Like the `list` skimmer, `many` skimmers never fail.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rule` | [`P`](classes/P.md)<`T`\> | The rule to match. |

#### Returns

[`P`](classes/P.md)<`T`[]\>

#### Defined in

skim.ts:564

___

### maybe

▸ **maybe**<`T`\>(`rule`): [`P`](classes/P.md)<``null`` \| `T`\>

Returns a skimmer that optionally matches
the given rule. If no match is found,
returns a skimmer whose result is `null`, and
the subsequent skimmer will pick up at its index.
If a match is found, returns a skimmer whose
result is type `T`. Like `list` and `many`
skimmers, `maybe` skimmers never fail.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rule` | [`P`](classes/P.md)<`T`\> | The rule to match. |

#### Returns

[`P`](classes/P.md)<``null`` \| `T`\>

#### Defined in

skim.ts:594

___

### minus

▸ **minus**(`x`, `y`): `number`

Computes the difference of two numbers, `x`
and `y`. This function has an arity of 2.

**`Example`**

```ts
~~~
const x = minus(7,3) // 4
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:37](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L37)

___

### mod

▸ **mod**(`x`, `y`): `number`

Computes the modulo of the two supplied arguments.

**`Example`**

```ts
~~~
const x = mod(5,22) // 5
const x = mod(-2,22) // 20
const x = mod(-21,22) // 1
const x = mod(0,22) // 0
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:190](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L190)

___

### neq

▸ **neq**(`x`, `y`): `boolean`

Returns true if the two supplied arguments are not
equal, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:212](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L212)

___

### number

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches the given number exactly.

**`Example`**

```ts
~~~
const P = number('0');
const res = P.run('0');
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | \`${number}\` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1102

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any positive integer or zero.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"natural"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1107

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only positive integers,
allowing an optional leading `+`. This
does not include `+0`, since `0` is neither
positive nor negative.

**`Example`**

```ts
~~~
const P = number("+int");
const r1 = P.run("+157"); // result: '+157'
const r2 = P.run("34"); // result: '34'
const r3 = P.run('+0') // result: null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+int"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1122

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matchy any and only positive integers,
disallowing a leading `+`.

**`Example`**

```ts
~~~
const P = number('whole');
const res = P.run(`258`); // 258
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"whole"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1134

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only negative integers.
Does not parse `-0`, since `0` is neither
positive nor negative.

**`Example`**

```ts
~~~
const P = number('-int');
const r1 = P.run("-28"); // reads '-28'
const r2 = P.run("-0"); // result: null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"-int"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1147

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches 0, a positive integer, or a negative
integer.

**`Example`**

```ts
~~~
const int = number('int');
const r1 = int.run("-28"); // result: '-28'
const r2 = int.run("0"); // result: '0'
const r3 = int.run("5"); // result: '5'
const r4 = int.run("+5"); // result: null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"int"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1161

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only unsigned floating
point numbers of the form `natural.natural`.
No leading `+`is recognized.

**`Example`**

```ts
~~~
const ufloat = number('ufloat');
const r1 = ufloat.run("1.1"); // result: '1.1'
const r2 = ufloat.run("0.0"); // result: '0.0'
const r3 = ufloat.run("0"); // result: null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"ufloat"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1175

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches any and only unsigned floating
point numbers of the form `.natural`.
No leading `+` is recognized.

**`Example`**

```ts
~~~
const P = number("udotnum");
const res = P.run(`.001`); // '.001'
const res = P.run(`.0`); // '.0'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"udotnum"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1188

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches any floating
point number of the form `.natural`.
No leading `+` is recognized, but the `-`
will be recognized for negatives.

**`Example`**

```ts
~~~
const P = number("dotnum");
const res = P.run(`.001`); // '.001'
const res = P.run(`.0`); // '.0'
const res = P.run(`-.22`); // '-.22'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"dotnum"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1203

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches any and only negative floating
point numbers of the form `-.natural`.
Will not read `-.0`.

**`Example`**

```ts
~~~
const P = number("-dotnum");
const r1 = P.run(`-.001`); // '-.001'
const r2 = P.run(`-.0`); // null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"-dotnum"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1216

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches any and only positive floating
point numbers of the form `+.natural`.
Will not read `+.0`.

**`Example`**

```ts
~~~
const P = number("+dotnum");
const r1 = P.run(`+.001`); // '-.001'
const r2 = P.run(`+.0`); // null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+dotnum"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1229

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches any and only positive floating
point numbers of the form `natural.natural`,
without a leading `+`.

**`Example`**

```ts
~~~
const P = number('ufloat');
const a = P.run("1.1"); // '1.1'
const b = P.run("0.0"); // '0.0'
const c = P.run("1.3912"); // '1.3912'
const d = P.run("0.390"); // '0.390'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"ufloat"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1243

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only positive floating
point numbers, allowing an optional
leading `+`. Does not recognize `0.0`
or `-0.0`. The decimal must have
a leading digit.

**`Example`**

```ts
~~~
const P = number('+float');
const r1 = P.run("0.0"); // '0.0'
const r2 = P.run("-0.0"); // null
const r3 = P.run("1.0"); // '1.0'
const r3 = P.run("+1.0"); // '+1.0'
const r3 = P.run("3.258"); // '3.258'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+float"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1261

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only negative floating
point numbers. Decimal must have a
leading digit. Will not read `-0.0`.

**`Example`**

```ts
~~~
const P = number('-float');
const r1 = P.run("-1.2"); // '-1.2'
const r2 = P.run("-0.0"); // null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"-float"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1274

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only floating
point numbers of the form `N.N`,
where `N` is a natural number. Will
not read a leading `+`, but will
recognize `-`. Does not recognize `-0.0`.

**`Example`**

```ts
~~~
const P = number('float');
const r1 = P.run(`3.147`); // '3.147'
const r2 = P.run(`2.3`); // '2.3'
const r3 = P.run(`-0.125`); // '-0.125'
const r4 = P.run(`-0.0`); // null
const r5 = P.run(`0.0001`); // '0.0001'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"float"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1292

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only hexadecimals.
Hexadecimals are of the format:

`0x[0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f]`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"hex"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1300

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match hexadecimals (of upper-case letters `A-F`)
prefaced with a `-`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+-HEX"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1306

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match hexadecimals (of lower-case letters `a-f`)
prefaced with a `+`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+-hex"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1312

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only hexadecimals
of the format:

`0x[0|1|2|3|4|5|6|7|8|9|A|B|C|D|E|F]`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"HEX"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1320

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only octal numbers
of the format:

`0o[0|1|2|3|4|5|6|7|8|9]`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"octal"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1328

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches octal numbers prefaced
with a `-` or `+`.

`0o[0|1|2|3|4|5|6|7|8|9]`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+-octal"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1336

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match binary numbers
of the format:

`0b[0|1]`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"binary"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1344

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches binary numbers prefaced with
a `-` or `+`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"+-binary"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1350

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only numbers of the format:

`[real]e[int]`

**`Example`**

```ts
~~~
const P = number('scientific');
const a = P.run(`-1.2e5`); // '-1.2e5'
const b = P.run(`+.2e+5`); // '+.2e+5'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"scientific"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1364

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only numbers of the format:

`[real]E[int]`

**`Example`**

```ts
~~~
const P = number('SCIENTIFIC');
const res = P.run(`-1.2E5`); // '-1.2E5'
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"SCIENTIFIC"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1377

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only numbers of the format:

`(-|+)[int]/[int]`

The forward slash is whitespace-sensitive. It will
not match against, say, `3 / 5`.

**`Example`**

```ts
~~~
const P = number('fraction');
const r1 = P.run(`3/2`);  // '3/2'
const r2 = P.run(`+1/2`); // '+1/2'
const r3 = P.run(`1 / 2`); // null
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"fraction"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1394

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Reads signed fractions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"signed-fraction"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1399

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match any and only numbers of the format:

`[real] [+|-] [real]i`

The letter `i` is whitespace-sensitive. It will
not match against `3 + 5i`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"complex"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1409

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match against all number options
except `complex`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"real"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1415

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches against unsigned fractions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"unsigned-fraction"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1420

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Matches against numbers with thousands
separators.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"int_int"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1426

▸ **number**(`pattern`): [`P`](classes/P.md)<`string`\>

Match against all number options

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | ``"any"`` |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:1429

___

### odd

▸ **odd**(`x`): `boolean`

Returns true if `x` is odd, false otherwise.

**`Example`**

```ts
~~~
const a = even(2) // false
const b = even(3) // true
const c = even(0) // false
const d = even(3.5) // false
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

#### Returns

`boolean`

#### Defined in

[core/count.ts:256](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L256)

___

### one

▸ **one**(`rule`): [`P`](classes/P.md)<`string`\>

Skims exactly one character of the given rule,
white-space sensitive. If no match is found,
the error state’s result is an empty string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rule` | `string` | The expected character. |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:423

___

### pow

▸ **pow**(`x`, `y`): `number`

Returns the power of the two supplied arguments.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:195](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L195)

___

### product

▸ **product**(`...terms`): `number`

Computes the product of the supplied terms.

**`Example`**

```ts
~~~
const x = product(3,4,2,5); // 120
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `...terms` | `number`[] |

#### Returns

`number`

#### Defined in

[core/count.ts:116](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L116)

___

### quot

▸ **quot**(`x`, `y`): `number`

Computes the integer quotient of the supplied
terms.

_Comment_. This operation follows the mathematical
definition of integer division. If either of the
operands are negative, the result is floored. This
is in contrast to the implementation of integer
division in C, where the result is truncated towards
zero.

**`Example`**

```ts
~~~
const x = quot(2,3) // 0
const y = quot(-2,3) // -1
const z = quot(-9,2) // -5
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:143](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L143)

___

### regex

▸ **regex**(`pattern`): [`P`](classes/P.md)<`string`\>

Returns a skimmer that runs according
to the given regular expression. The
regular expression must begin with `^`.
Otherwise, an error is returned.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pattern` | `RegExp` | The regular expression the skimmer should follow. |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:692

___

### rem

▸ **rem**(`x`, `y`): `number`

Computes the integer remainder of the two supplied
arguments (`x % y`). For the modulo operation,
see [mod](modules.md#mod).

_Comment_. It is highly unlikely that you would
ever need this operator. The vast, vast majority
of cases using the `%` operator never utilize a
negative remainder. Implementing `%` as a signed
remainder is a mistake that languages have persisted
because of history. It’s almost certainly the case
that what you need is the [mod](modules.md#mod) operator, not
`rem`.

**`Example`**

```ts
~~~
const a = rem(13,5) // 3
const b = rem(-13,5) // -3
const c = rem(4,2) // 0
const d = rem(-4,2) // -0
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:177](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L177)

___

### root

▸ **root**(`x`, `n`): `number`

Returns the `n`th root of `x`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `n` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:200](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L200)

___

### sepby

▸ **sepby**<`S`\>(`separator`): <C\>(`content`: [`P`](classes/P.md)<`C`\>) => [`P`](classes/P.md)<`C`[]\>

Returns a skimmer for content separated by the given
separator. Useful for skimming comma-separated text.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `separator` | [`P`](classes/P.md)<`S`\> | The separator’s skimmer. E.g., `,`. |

#### Returns

`fn`

A function that takes a content-skimmer.

▸ <`C`\>(`content`): [`P`](classes/P.md)<`C`[]\>

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `content` | [`P`](classes/P.md)<`C`\> |

##### Returns

[`P`](classes/P.md)<`C`[]\>

#### Defined in

skim.ts:656

___

### skip

▸ **skip**(`rule`): [`P`](classes/P.md)<`any`\>

Returns a skimmer that skips the given
rule in the event of a match. If a match
is found, the result is `null` (prompting
sequential parsers such as `list` and `many`
to ignore its result). If a match
is not found, returns the next state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rule` | [`P`](classes/P.md)<`any`\> | The rule to skip. |

#### Returns

[`P`](classes/P.md)<`any`\>

#### Defined in

skim.ts:611

___

### some

▸ **some**<`T`, `A`\>(`rules`): [`P`](classes/P.md)<`A` extends [`P`](classes/P.md)<`T`\>[] ? `T` : `never`\>

Returns a skimmer that skims successfully on the first
successful result. If no match is found, returns a failed
skim whose result is null.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `any`[] |
| `A` | extends [`P`](classes/P.md)<[...T[]][`number`]\>[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rules` | [...A[]] | A list of rules to match. |

#### Returns

[`P`](classes/P.md)<`A` extends [`P`](classes/P.md)<`T`\>[] ? `T` : `never`\>

#### Defined in

skim.ts:534

___

### success

▸ **success**<`A`, `B`\>(`prev`, `result`, `index`): [`SkimState`](modules.md#skimstate)<`B`\>

Creates a new successful state.

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prev` | [`SkimState`](modules.md#skimstate)<`A`\> | The previous state. |
| `result` | `B` | The result of the skim. |
| `index` | `number` | The post-skim position within the input text for the next skimmer to start on. |

#### Returns

[`SkimState`](modules.md#skimstate)<`B`\>

#### Defined in

skim.ts:100

___

### sum

▸ **sum**(`...xs`): `number`

Computes the sum of all the numeric
arguments passed.

**`Example`**

```ts
const x = sum(1,2,3,4); // 10
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `...xs` | `number`[] |

#### Returns

`number`

#### Defined in

[core/count.ts:20](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L20)

___

### times

▸ **times**(`x`, `y`): `number`

Computes the product of two numbers, `x` and
`y`.

**`Example`**

```ts
~~~
const x = times(4,8) // 32
~~~
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[core/count.ts:107](https://github.com/ketiboldiais/webtex/blob/4584902/ui/vtex/src/lib/lang/core/count.ts#L107)

___

### word

▸ **word**(`rules`): [`P`](classes/P.md)<`string`\>

Returns a skimmer for the given word,
ignoring leading white-spaces.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rules` | [`P`](classes/P.md)<``null`` \| `string`\>[] |

#### Returns

[`P`](classes/P.md)<`string`\>

#### Defined in

skim.ts:715
