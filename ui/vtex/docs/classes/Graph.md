[@webtex/vtex](../README.md) / [Exports](../modules.md) / Graph

# Class: Graph

## Hierarchy

- [`Frame`](Frame.md)

  ↳ **`Graph`**

## Table of contents

### Constructors

- [constructor](Graph.md#constructor)

### Properties

- [MARGINS](Graph.md#margins)
- [absoluteHeight](Graph.md#absoluteheight)
- [absoluteWidth](Graph.md#absolutewidth)
- [edges](Graph.md#edges)
- [forceCenterX](Graph.md#forcecenterx)
- [forceCenterY](Graph.md#forcecentery)
- [forceCharge](Graph.md#forcecharge)
- [forceCollide](Graph.md#forcecollide)
- [forceLinkDistance](Graph.md#forcelinkdistance)
- [nodes](Graph.md#nodes)

### Methods

- [charge](Graph.md#charge)
- [collide](Graph.md#collide)
- [edgeSep](Graph.md#edgesep)
- [edgemap](Graph.md#edgemap)
- [forceCenter](Graph.md#forcecenter)
- [height](Graph.md#height)
- [marginBottom](Graph.md#marginbottom)
- [marginLeft](Graph.md#marginleft)
- [marginOf](Graph.md#marginof)
- [marginRight](Graph.md#marginright)
- [marginTop](Graph.md#margintop)
- [margins](Graph.md#margins-1)
- [nodemap](Graph.md#nodemap)
- [relative](Graph.md#relative)
- [width](Graph.md#width)

## Constructors

### constructor

• **new Graph**(`edges`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `edges` | ([`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md) \| [`Edge`](Edge.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Edge`](Edge.md)\> & [`Colorable`](../interfaces/Colorable.md))[] |

#### Overrides

[Frame](Frame.md).[constructor](Frame.md#constructor)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:136

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

### edges

• **edges**: [`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md)[]

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:134

___

### forceCenterX

• `Optional` **forceCenterX**: `number`

The force layout’s center force along the x-axis.

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:165

___

### forceCenterY

• `Optional` **forceCenterY**: `number`

The force layout’s center force along the y-axis.

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:167

___

### forceCharge

• `Optional` **forceCharge**: `number`

The strength of repulsion/attraction
between the elements.

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:182

___

### forceCollide

• `Optional` **forceCollide**: `number`

The threshhold for when an overlap
is deemed to have occurred.

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:198

___

### forceLinkDistance

• `Optional` **forceLinkDistance**: `number`

The fixed distance between
each edge.

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:214

___

### nodes

• **nodes**: `Record`<`string`, [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)\> = `{}`

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:135

## Methods

### charge

▸ **charge**(`value`): [`Graph`](Graph.md)

Sets the [forceCharge](Graph.md#forcecharge).
Large values will cause attraction,
smaller values will cause repulsion.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:189

___

### collide

▸ **collide**(`value`): [`Graph`](Graph.md)

Sets the [forceCollide](Graph.md#forcecollide).
The value passed defines when an
overlap occurs.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:205

___

### edgeSep

▸ **edgeSep**(`value`): [`Graph`](Graph.md)

Sets the [forceLinkDistance](Graph.md#forcelinkdistance).

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:219

___

### edgemap

▸ **edgemap**(`f`): [`Graph`](Graph.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`n`: [`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md)) => [`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md) |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:156

___

### forceCenter

▸ **forceCenter**(`x`, `y?`): [`Graph`](Graph.md)

Sets the center of the force layout.
The center force ensures the graph’s elements
are centered.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `x` | `number` | `undefined` |
| `y` | `number` | `x` |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:173

___

### height

▸ **height**(`value`): [`Graph`](Graph.md)

Sets the root figure’s height.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[height](Frame.md#height)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:25

___

### marginBottom

▸ **marginBottom**(`value`): [`Graph`](Graph.md)

Sets the bottom margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[marginBottom](Frame.md#marginbottom)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:78

___

### marginLeft

▸ **marginLeft**(`value`): [`Graph`](Graph.md)

Sets the left margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

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

▸ **marginRight**(`value`): [`Graph`](Graph.md)

Sets the right margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[marginRight](Frame.md#marginright)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:71

___

### marginTop

▸ **marginTop**(`value`): [`Graph`](Graph.md)

Sets the top margin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[marginTop](Frame.md#margintop)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:64

___

### margins

▸ **margins**(`top`, `right`, `bottom?`, `left?`): [`Graph`](Graph.md)

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

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[margins](Frame.md#margins-1)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:124

___

### nodemap

▸ **nodemap**(`f`): [`Graph`](Graph.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`n`: [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)) => [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md) |

#### Returns

[`Graph`](Graph.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:160

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

### width

▸ **width**(`value`): [`Graph`](Graph.md)

Sets the root figure’s width.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Graph`](Graph.md)

#### Inherited from

[Frame](Frame.md).[width](Frame.md#width)

#### Defined in

ui/vtex/src/lib/weave/warp/frame.ts:12
