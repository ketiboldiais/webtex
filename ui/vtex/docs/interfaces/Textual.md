[@webtex/vtex](../README.md) / [Exports](../modules.md) / Textual

# Interface: Textual

## Table of contents

### Properties

- [fontColor](Textual.md#fontcolor)
- [fontFamily](Textual.md#fontfamily)
- [fontSize](Textual.md#fontsize)
- [textDx](Textual.md#textdx)
- [textDy](Textual.md#textdy)

### Methods

- [font](Textual.md#font)
- [tx](Textual.md#tx)
- [ty](Textual.md#ty)

## Properties

### fontColor

• `Optional` **fontColor**: `string`

The renderable’s font color.

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:17

___

### fontFamily

• `Optional` **fontFamily**: `string`

The renderable’s font-family.

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:12

___

### fontSize

• `Optional` **fontSize**: `string` \| `number`

The renderable’s font size.

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:7

___

### textDx

• `Optional` **textDx**: `number`

The renderable’s text offset
along the x-axis.

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:23

___

### textDy

• `Optional` **textDy**: `number`

The renderable’s text offset along
the y-axis.

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:35

## Methods

### font

▸ **font**(`option`, `value`): [`Textual`](Textual.md)

Sets the renderable’s font attributes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option` | ``"color"`` \| ``"size"`` \| ``"family"`` | One of the following strings: - `size` - Sets the font size. - `family` - Sets the font’s family. - `color` - Sets the font color. |
| `value` | `string` \| `number` | - |

#### Returns

[`Textual`](Textual.md)

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:51

___

### tx

▸ **tx**(`value`): [`Textual`](Textual.md)

Sets the renderable’s text offset
along the x-axis.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Textual`](Textual.md)

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:29

___

### ty

▸ **ty**(`value`): [`Textual`](Textual.md)

Sets the renderable’s text offset
along the y-axis.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Textual`](Textual.md)

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:41
