[@webtex/vtex](../README.md) / [Exports](../modules.md) / Scalable

# Interface: Scalable

## Table of contents

### Properties

- [domain](Scalable.md#domain)
- [range](Scalable.md#range)

### Methods

- [dom](Scalable.md#dom)
- [ran](Scalable.md#ran)
- [scale](Scalable.md#scale)

## Properties

### domain

• **domain**: [`number`, `number`]

The scalable’s domain.

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:27

___

### range

• **range**: [`number`, `number`]

The scalable’s range.

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:30

## Methods

### dom

▸ **dom**(`xmin`, `xmax`): [`Scalable`](Scalable.md)

Sets the scalable’s domain.

#### Parameters

| Name | Type |
| :------ | :------ |
| `xmin` | `number` |
| `xmax` | `number` |

#### Returns

[`Scalable`](Scalable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:33

___

### ran

▸ **ran**(`ymin`, `ymax`): [`Scalable`](Scalable.md)

Sets the scalable’s range.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ymin` | `number` |
| `ymax` | `number` |

#### Returns

[`Scalable`](Scalable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:36

___

### scale

▸ **scale**(`type`): [`Scaler`](../modules.md#scaler)

Returns a scale function based on
the scalable’s width, height, and margins.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`ScaleName`](../modules.md#scalename) | A string-value scale name: 1. `"linear"` - Returns a linear scale. 2. `"power"` - Returns a power scale. 3. `"log"` - Returns a log scale. 4. `"radial"` - Returns a radial scale. |

#### Returns

[`Scaler`](../modules.md#scaler)

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:48
