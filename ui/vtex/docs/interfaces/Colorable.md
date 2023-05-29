[@webtex/vtex](../README.md) / [Exports](../modules.md) / Colorable

# Interface: Colorable

## Table of contents

### Properties

- [fillColor](Colorable.md#fillcolor)
- [opacityValue](Colorable.md#opacityvalue)
- [strokeColor](Colorable.md#strokecolor)
- [strokeDashArray](Colorable.md#strokedasharray)
- [strokeWidth](Colorable.md#strokewidth)

### Methods

- [dash](Colorable.md#dash)
- [fill](Colorable.md#fill)
- [opacity](Colorable.md#opacity)
- [stroke](Colorable.md#stroke)
- [sw](Colorable.md#sw)

## Properties

### fillColor

• `Optional` **fillColor**: `string`

The renderable node’s fill color.

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:17

___

### opacityValue

• `Optional` **opacityValue**: `number`

The renderable node’s opacity, a number
between 0 and 1. Values tending towards 0
appear more transparent, and values tending
towards 1 less transparent.

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:52

___

### strokeColor

• `Optional` **strokeColor**: `string`

The renderable node’s stroke color.

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:7

___

### strokeDashArray

• `Optional` **strokeDashArray**: `number`

The renderable node’s dash property.
If 0, a solid line is shown.

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:39

___

### strokeWidth

• `Optional` **strokeWidth**: `number`

The renderable node’s stroke width
(how thick the node’s outline is).

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:28

## Methods

### dash

▸ **dash**(`value`): [`Colorable`](Colorable.md)

Sets the renderable node’s dash property.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Colorable`](Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:44

___

### fill

▸ **fill**(`color`): [`Colorable`](Colorable.md)

Sets the renderable node’s fill color.

#### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `string` |

#### Returns

[`Colorable`](Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:22

___

### opacity

▸ **opacity**(`value`): [`Colorable`](Colorable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Colorable`](Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:53

___

### stroke

▸ **stroke**(`color`): [`Colorable`](Colorable.md)

Sets the renderable node’s stroke color.

#### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `string` |

#### Returns

[`Colorable`](Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:12

___

### sw

▸ **sw**(`value`): [`Colorable`](Colorable.md)

Sets the renderable node’s stroke width.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Colorable`](Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:33
