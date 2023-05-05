[@webtex/vtex](../README.md) / [Exports](../modules.md) / P

# Class: P<A\>

## Type parameters

| Name |
| :------ |
| `A` |

## Table of contents

### Constructors

- [constructor](P.md#constructor)

### Properties

- [skim](P.md#skim)

### Methods

- [and](P.md#and)
- [butNot](P.md#butnot)
- [errdef](P.md#errdef)
- [map](P.md#map)
- [optional](P.md#optional)
- [or](P.md#or)
- [repeating](P.md#repeating)
- [run](P.md#run)
- [strung](P.md#strung)
- [then](P.md#then)
- [times](P.md#times)
- [NIL](P.md#nil)

## Constructors

### constructor

• **new P**<`A`\>(`skimRule`)

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `skimRule` | [`SkimRule`](../modules.md#skimrule)<`A`\> |

#### Defined in

skim.ts:148

## Properties

### skim

• `Readonly` **skim**: [`SkimRule`](../modules.md#skimrule)<`A`\>

#### Defined in

skim.ts:147

## Methods

### and

▸ **and**<`B`\>(`other`): [`P`](P.md)<``null`` \| [`A`, `B`]\>

Returns a skimmer that successfully skims only if
this skimmer and `other` both successfully parse. The
result is a pair `[A,B]`, where `A` is the result type of
this skimmer, and `B` is the result type of `other`.
Equivalent to a logical `AND` skim.

#### Type parameters

| Name |
| :------ |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`P`](P.md)<`B`\> | The second prong of the skim. |

#### Returns

[`P`](P.md)<``null`` \| [`A`, `B`]\>

#### Defined in

skim.ts:239

___

### butNot

▸ **butNot**<`B`\>(`other`): [`P`](P.md)<``null`` \| `A`\>

Returns a skimmer that successfully skims
only if this skimmer succeeds and `other` fails.
That is, if either:

1. Both skimmers succeed (pattern A followed by pattern B), or
2. Both skimmers fail,

then a failed skim is returned with a result of null.

#### Type parameters

| Name |
| :------ |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`P`](P.md)<`B`\> | The disallowed pattern |

#### Returns

[`P`](P.md)<``null`` \| `A`\>

#### Defined in

skim.ts:311

___

### errdef

▸ **errdef**(`parserName`, `errorMessage?`): [`P`](P.md)<`any`\>

Defines a specific error value for this parser.
If an error occurs, the arguments passed will
be used as the error field’s value. The error
message is optional, but a parser name must be
provided.

#### Parameters

| Name | Type |
| :------ | :------ |
| `parserName` | `string` |
| `errorMessage?` | `string` |

#### Returns

[`P`](P.md)<`any`\>

#### Defined in

skim.ts:190

___

### map

▸ **map**<`B`\>(`resultTransformer`): [`P`](P.md)<`B`\>

Transforms the result of a successful skim,
from a result of type `A` to a result of type `B`.
The result will only be transformed if the skim
succeeds.

#### Type parameters

| Name |
| :------ |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resultTransformer` | (`result`: `A`) => `B` | A callback function that returns a new result of type `B`, given a successful skim. |

#### Returns

[`P`](P.md)<`B`\>

#### Defined in

skim.ts:167

___

### optional

▸ **optional**(): [`P`](P.md)<`string`\>

Declares this skimmer as optional.
If the skimmer succeeds, its result
is returned. If the skimmer fails,
an empty string result is returned.
Like all the other getters, the skimmer
must return a string as a result. For
a generic version of `optional`, use
the `maybe` skimmer.

#### Returns

[`P`](P.md)<`string`\>

#### Defined in

skim.ts:402

___

### or

▸ **or**<`B`\>(`other`): [`P`](P.md)<`A` \| `B`\>

Returns a skimmer that successfully skims only if
at least one of this skimmer or other successfully parsers.
If this skimmer succeeds, returns a skimmer of type P<A>.
If `other` succeeds, returns a skimmer of type P<B>.
If neither succeeds, returns a skimmer of type P<null> in error.
Equivalent to a logical `OR` skim.

#### Type parameters

| Name |
| :------ |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`P`](P.md)<`B`\> | The second prong of the skim. |

#### Returns

[`P`](P.md)<`A` \| `B`\>

#### Defined in

skim.ts:285

___

### repeating

▸ **repeating**(): [`P`](P.md)<`string`\>

Repeats this skimmer for as many matches as possible.
Equivalent to calling the `some` function.

#### Returns

[`P`](P.md)<`string`\>

#### Defined in

skim.ts:369

___

### run

▸ **run**(`sourceText`): [`SkimState`](../modules.md#skimstate)<`A`\>

Runs a skim on the given source text.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sourceText` | `string` |

#### Returns

[`SkimState`](../modules.md#skimstate)<`A`\>

#### Defined in

skim.ts:153

___

### strung

▸ **strung**(): [`P`](P.md)<`string`\>

Returns the array of results joined as a single-string.
If the skimmer does not return an array of results,
this method will return an error. This method is defined
as a getter for convience, but it should only be called
with absolute certainty that the returned skim result
is an array.

#### Returns

[`P`](P.md)<`string`\>

#### Defined in

skim.ts:345

___

### then

▸ **then**<`B`\>(`next`): [`P`](P.md)<`B`\>

Executes the next parser given the result
of this parser, providing a method of chaining
parsers.

#### Type parameters

| Name |
| :------ |
| `B` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `next` | (`result`: `A`, `nextChar`: `string`) => [`P`](P.md)<`B`\> | A function that, given the result of this parsing, returns some parser B. |

#### Returns

[`P`](P.md)<`B`\>

#### Defined in

skim.ts:212

___

### times

▸ **times**(`n`): [`P`](P.md)<`A`[]\>

Applies this parser exactly `n`
times.

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |

#### Returns

[`P`](P.md)<`A`[]\>

#### Defined in

skim.ts:259

___

### NIL

▸ `Static` **NIL**(): [`P`](P.md)<`any`\>

#### Returns

[`P`](P.md)<`any`\>

#### Defined in

skim.ts:331
