[@webtex/vtex](../README.md) / [Exports](../modules.md) / Axis

# Class: Axis

## Table of contents

### Constructors

- [constructor](Axis.md#constructor)

### Properties

- [direction](Axis.md#direction)

### Methods

- [is](Axis.md#is)

## Constructors

### constructor

• **new Axis**(`direction`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `direction` | `Direction2D` |

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:168

## Properties

### direction

• `Readonly` **direction**: `Direction2D`

The direction of this axis.
Either `x` or `y`.

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:167

## Methods

### is

▸ **is**(`direction`): `boolean`

Returns true if this axis is
of the provided direction, `"x"`
or `"y"`, false otherwise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `direction` | `Direction2D` |

#### Returns

`boolean`

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:176
