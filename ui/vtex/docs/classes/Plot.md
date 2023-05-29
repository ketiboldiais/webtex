[@webtex/vtex](../README.md) / [Exports](../modules.md) / Plot

# Class: Plot

## Table of contents

### Constructors

- [constructor](Plot.md#constructor)

### Properties

- [children](Plot.md#children)
- [def](Plot.md#def)
- [sampleCount](Plot.md#samplecount)

### Methods

- [and](Plot.md#and)
- [samples](Plot.md#samples)

## Constructors

### constructor

• **new Plot**(`def`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `def` | `string` |

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:94

## Properties

### children

• **children**: [`Integral`](Integral.md) & [`Colorable`](../interfaces/Colorable.md) & [`Typed`](../interfaces/Typed.md)<`And`<typeof [`Integral`](Integral.md), [`Colorable`](../interfaces/Colorable.md)\>\>[] = `[]`

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:61

___

### def

• **def**: `string`

The function’s definition.
Definitions must take the form:
```
<id1>(<id2>) = <id2> | <expression>
```
For example:
~~~
f(x) = cos(x);
~~~

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:73

___

### sampleCount

• `Optional` **sampleCount**: `number`

The number of samples to generate
for the plot render. A higher value
will generate sharper renderings at
the cost of performance and memory.
Capped at 1000.

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:82

## Methods

### and

▸ **and**(`child`): [`Plot`](Plot.md)

Includes a subchild of this plot.
Valid subchildren include:

1. [integrals](../modules.md#$integral),

#### Parameters

| Name | Type |
| :------ | :------ |
| `child` | [`Integral`](Integral.md) & [`Colorable`](../interfaces/Colorable.md) & [`Typed`](../interfaces/Typed.md)<`And`<typeof [`Integral`](Integral.md), [`Colorable`](../interfaces/Colorable.md)\>\> |

#### Returns

[`Plot`](Plot.md)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:104

___

### samples

▸ **samples**(`value`): [`Plot`](Plot.md)

Sets the [sampleCount](Plot.md#samplecount).

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plot`](Plot.md)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:87
