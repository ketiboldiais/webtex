[@webtex/vtex](../README.md) / [Exports](../modules.md) / Plane

# Class: Plane

## Hierarchy

- [`Frame`](Frame.md)

  ↳ **`Plane`**

## Table of contents

### Constructors

- [constructor](Plane.md#constructor)

### Properties

- [MARGINS](Plane.md#margins)
- [absoluteHeight](Plane.md#absoluteheight)
- [absoluteWidth](Plane.md#absolutewidth)
- [children](Plane.md#children)
- [sampleCount](Plane.md#samplecount)

### Methods

- [height](Plane.md#height)
- [marginBottom](Plane.md#marginbottom)
- [marginLeft](Plane.md#marginleft)
- [marginOf](Plane.md#marginof)
- [marginRight](Plane.md#marginright)
- [marginTop](Plane.md#margintop)
- [margins](Plane.md#margins-1)
- [relative](Plane.md#relative)
- [samples](Plane.md#samples)
- [width](Plane.md#width)

## Constructors

### constructor

• **new Plane**(`children`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `children` | [`$Plottable`](../modules.md#$plottable)[] |

#### Overrides

[Frame](Frame.md).[constructor](Frame.md#constructor)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:11

## Properties

### MARGINS

• **MARGINS**: [`number`, `number`, `number`, `number`]

Sets the frame’s margins, a number
quadruple corresponding to:
~~~
[top, right, bottom, left]
~~~

#### Inherited from

[Frame](Frame.md).[MARGINS](Frame.md#margins)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:59

___

### absoluteHeight

• **absoluteHeight**: `number` = `500`

The root figure’s height.

#### Inherited from

[Frame](Frame.md).[absoluteHeight](Frame.md#absoluteheight)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:20

___

### absoluteWidth

• **absoluteWidth**: `number` = `500`

The root figure’s width.

#### Inherited from

[Frame](Frame.md).[absoluteWidth](Frame.md#absolutewidth)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:7

___

### children

• **children**: [`$Plottable`](../modules.md#$plottable)[]

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:10

___

### sampleCount

• **sampleCount**: `number` = `250`

The number of samples to generate
for the plot render. A higher value
will generate sharper renderings at
the cost of performance and memory.
Capped at 1000, and defaults to 250.

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:22

## Methods

### height

▸ **height**(`value`): [`Plane`](Plane.md)

Sets the root figure’s height.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[height](Frame.md#height)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:25

___

### marginBottom

▸ **marginBottom**(`value`): [`Plane`](Plane.md)

Sets the bottom margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[marginBottom](Frame.md#marginbottom)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:78

___

### marginLeft

▸ **marginLeft**(`value`): [`Plane`](Plane.md)

Sets the left margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[marginLeft](Frame.md#marginleft)

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

#### Inherited from

[Frame](Frame.md).[marginOf](Frame.md#marginof)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:101

___

### marginRight

▸ **marginRight**(`value`): [`Plane`](Plane.md)

Sets the right margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[marginRight](Frame.md#marginright)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:71

___

### marginTop

▸ **marginTop**(`value`): [`Plane`](Plane.md)

Sets the top margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[marginTop](Frame.md#margintop)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:64

___

### margins

▸ **margins**(`top`, `right`, `bottom?`, `left?`): [`Plane`](Plane.md)

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

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[margins](Frame.md#margins-1)

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

#### Inherited from

[Frame](Frame.md).[relative](Frame.md#relative)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:40

___

### samples

▸ **samples**(`value`): [`Plane`](Plane.md)

Sets the [sampleCount](Plane.md#samplecount).
If set, all children of type [$Plot](../modules.md#$plot)
will have their sample counts properties
set to the provided value if they aren’t
already set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:31

___

### width

▸ **width**(`value`): [`Plane`](Plane.md)

Sets the root figure’s width.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Plane`](Plane.md)

#### Inherited from

[Frame](Frame.md).[width](Frame.md#width)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:12
