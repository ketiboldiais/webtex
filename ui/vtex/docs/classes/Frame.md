[@webtex/vtex](../README.md) / [Exports](../modules.md) / Frame

# Class: Frame

## Hierarchy

- **`Frame`**

  ↳ [`Plane`](Plane.md)

  ↳ [`Graph`](Graph.md)

## Table of contents

### Constructors

- [constructor](Frame.md#constructor)

### Properties

- [MARGINS](Frame.md#margins)
- [absoluteHeight](Frame.md#absoluteheight)
- [absoluteWidth](Frame.md#absolutewidth)

### Methods

- [height](Frame.md#height)
- [marginBottom](Frame.md#marginbottom)
- [marginLeft](Frame.md#marginleft)
- [marginOf](Frame.md#marginof)
- [marginRight](Frame.md#marginright)
- [marginTop](Frame.md#margintop)
- [margins](Frame.md#margins-1)
- [relative](Frame.md#relative)
- [width](Frame.md#width)

## Constructors

### constructor

• **new Frame**()

## Properties

### MARGINS

• **MARGINS**: [`number`, `number`, `number`, `number`]

Sets the frame’s margins, a number
quadruple corresponding to:
~~~
[top, right, bottom, left]
~~~

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:59

___

### absoluteHeight

• **absoluteHeight**: `number` = `500`

The root figure’s height.

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:20

___

### absoluteWidth

• **absoluteWidth**: `number` = `500`

The root figure’s width.

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:7

## Methods

### height

▸ **height**(`value`): [`Frame`](Frame.md)

Sets the root figure’s height.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:25

___

### marginBottom

▸ **marginBottom**(`value`): [`Frame`](Frame.md)

Sets the bottom margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:78

___

### marginLeft

▸ **marginLeft**(`value`): [`Frame`](Frame.md)

Sets the left margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:85

___

### marginOf

▸ **marginOf**(`order`): `number`

Returns the margin value of the given
order.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `order` | ``"top"`` \| ``"right"`` \| ``"bottom"`` \| ``"left"`` \| ``"x"`` \| ``"y"`` | One of: 1. `top` returns the value of the top margin. 2. `right` returns the value of the right margin. 3. `bottom` returns the value of the bottom margin. 4. `left` returns the value of the left margin. 5. `x` returns the sum of the left and right margins. 6. `y` returns the sum of the top and bottom margins. |

#### Returns

`number`

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:101

___

### marginRight

▸ **marginRight**(`value`): [`Frame`](Frame.md)

Sets the right margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:71

___

### marginTop

▸ **marginTop**(`value`): [`Frame`](Frame.md)

Sets the top margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:64

___

### margins

▸ **margins**(`top`, `right`, `bottom?`, `left?`): [`Frame`](Frame.md)

Sets the scalable’s margins. If only two
arguments are passed, sets the vertical
and horizontal margins respectively.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `top` | `number` | `undefined` | The top margin. |
| `right` | `number` | `undefined` | The right margin. |
| `bottom` | `number` | `top` | The bottom margin. |
| `left` | `number` | `right` | The left margin. |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:124

___

### relative

▸ **relative**(`dimension`): `number`

Returns the passed dimension’s value
relative to the dimension’s margins.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dimension` | ``"height"`` \| ``"width"`` | One of: 1. `height` returns the [absoluteHeight](Frame.md#absoluteheight) with the top and bottom margins subtracted. 2. `width` returns the [absoluteWidth](Frame.md#absolutewidth) with the left and right margins subtracted. |

#### Returns

`number`

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:40

___

### width

▸ **width**(`value`): [`Frame`](Frame.md)

Sets the root figure’s width.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Frame`](Frame.md)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:12
