[@webtex/vtex](README.md) / Exports

# @webtex/vtex

## Table of contents

### Classes

- [Axis](classes/Axis.md)
- [Edge](classes/Edge.md)
- [Frame](classes/Frame.md)
- [Graph](classes/Graph.md)
- [Integral](classes/Integral.md)
- [Link](classes/Link.md)
- [Plane](classes/Plane.md)
- [Plot](classes/Plot.md)
- [Vertex](classes/Vertex.md)

### Interfaces

- [Colorable](interfaces/Colorable.md)
- [Scalable](interfaces/Scalable.md)
- [Textual](interfaces/Textual.md)
- [Typed](interfaces/Typed.md)

### Type Aliases

- [$Axis](modules.md#$axis)
- [$Edge](modules.md#$edge)
- [$Graph](modules.md#$graph)
- [$Integral](modules.md#$integral)
- [$Link](modules.md#$link)
- [$Plane](modules.md#$plane)
- [$Plot](modules.md#$plot)
- [$Plottable](modules.md#$plottable)
- [$Vertex](modules.md#$vertex)
- [FigureProps](modules.md#figureprops)
- [LinearScale](modules.md#linearscale)
- [LogScale](modules.md#logscale)
- [PowerScale](modules.md#powerscale)
- [RadialScale](modules.md#radialscale)
- [ScaleName](modules.md#scalename)
- [Scaler](modules.md#scaler)
- [Weaver](modules.md#weaver)

### Functions

- [Figure](modules.md#figure)
- [axis](modules.md#axis)
- [colorable](modules.md#colorable)
- [e](modules.md#e)
- [edge](modules.md#edge)
- [graph](modules.md#graph)
- [integral](modules.md#integral)
- [isAxis](modules.md#isaxis)
- [isGraph](modules.md#isgraph)
- [isIntegral](modules.md#isintegral)
- [isLink](modules.md#islink)
- [isPlane](modules.md#isplane)
- [isPlot](modules.md#isplot)
- [isVertex](modules.md#isvertex)
- [link](modules.md#link)
- [plane](modules.md#plane)
- [plot](modules.md#plot)
- [scalable](modules.md#scalable)
- [textual](modules.md#textual)
- [typed](modules.md#typed)
- [v](modules.md#v)
- [vertex](modules.md#vertex)

## Type Aliases

### $Axis

Ƭ **$Axis**: `ReturnType`<typeof [`axis`](modules.md#axis)\>

A renderable [Axis](classes/Axis.md).

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:204

___

### $Edge

Ƭ **$Edge**: `ReturnType`<typeof [`edge`](modules.md#edge)\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:89

___

### $Graph

Ƭ **$Graph**: `ReturnType`<typeof [`graph`](modules.md#graph)\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:246

___

### $Integral

Ƭ **$Integral**: `ReturnType`<typeof [`integral`](modules.md#integral)\>

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:130

___

### $Link

Ƭ **$Link**: `ReturnType`<typeof [`link`](modules.md#link)\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:57

___

### $Plane

Ƭ **$Plane**: `ReturnType`<typeof [`plane`](modules.md#plane)\>

A renderable plane.

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:54

___

### $Plot

Ƭ **$Plot**: `ReturnType`<typeof [`plot`](modules.md#plot)\>

A renderable [Plot](classes/Plot.md).

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:156

___

### $Plottable

Ƭ **$Plottable**: [`$Plot`](modules.md#$plot) \| [`$Axis`](modules.md#$axis)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:206

___

### $Vertex

Ƭ **$Vertex**: `ReturnType`<typeof [`vertex`](modules.md#vertex)\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:131

___

### FigureProps

Ƭ **FigureProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `display?` | `CSSProperties`[``"display"``] |
| `free?` | `boolean` |
| `of` | `Twine` |
| `overflow?` | `CSSProperties`[``"overflow"``] |

#### Defined in

ui/vtex/src/lib/weave/Figure.tsx:30

___

### LinearScale

Ƭ **LinearScale**: `ScaleLinear`<`number`, `number`, `never`\>

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:14

___

### LogScale

Ƭ **LogScale**: `ScaleLogarithmic`<`number`, `number`, `never`\>

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:17

___

### PowerScale

Ƭ **PowerScale**: `ScalePower`<`number`, `number`, `never`\>

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:15

___

### RadialScale

Ƭ **RadialScale**: `ScaleRadial`<`number`, `number`, `never`\>

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:16

___

### ScaleName

Ƭ **ScaleName**: ``"linear"`` \| ``"power"`` \| ``"log"`` \| ``"radial"``

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:13

___

### Scaler

Ƭ **Scaler**: [`LinearScale`](modules.md#linearscale) \| [`PowerScale`](modules.md#powerscale) \| [`RadialScale`](modules.md#radialscale) \| [`LogScale`](modules.md#logscale)

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:19

___

### Weaver

Ƭ **Weaver**: [`$Plane`](modules.md#$plane) \| [`$Integral`](modules.md#$integral) \| [`$Plot`](modules.md#$plot) \| [`$Axis`](modules.md#$axis) \| [`$Vertex`](modules.md#$vertex) \| [`$Link`](modules.md#$link) \| [`$Edge`](modules.md#$edge) \| [`$Graph`](modules.md#$graph)

#### Defined in

ui/vtex/src/lib/weave/weavers.ts:6

## Functions

### Figure

▸ **Figure**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`FigureProps`](modules.md#figureprops) |

#### Returns

`Element`

#### Defined in

ui/vtex/src/lib/weave/Figure.tsx:37

___

### axis

▸ **axis**(`direction`): [`Axis`](classes/Axis.md) & [`Colorable`](interfaces/Colorable.md) & [`Scalable`](interfaces/Scalable.md) & [`Typed`](interfaces/Typed.md)<`And`<`And`<typeof [`Axis`](classes/Axis.md), [`Colorable`](interfaces/Colorable.md)\>, [`Scalable`](interfaces/Scalable.md)\>\>

Returns a new, renderable Axis2D.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | `Direction2D` | The direction of this axis, either `"x"` or `"y"`. |

#### Returns

[`Axis`](classes/Axis.md) & [`Colorable`](interfaces/Colorable.md) & [`Scalable`](interfaces/Scalable.md) & [`Typed`](interfaces/Typed.md)<`And`<`And`<typeof [`Axis`](classes/Axis.md), [`Colorable`](interfaces/Colorable.md)\>, [`Scalable`](interfaces/Scalable.md)\>\>

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:187

___

### colorable

▸ **colorable**<`NodeType`\>(`nodetype`): `And`<`NodeType`, [`Colorable`](interfaces/Colorable.md)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `NodeType` | extends `Figure`<{}\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodetype` | `NodeType` |

#### Returns

`And`<`NodeType`, [`Colorable`](interfaces/Colorable.md)\>

#### Defined in

ui/vtex/src/lib/weave/warp/colorable.ts:56

___

### e

▸ **e**(`...vertices`): [`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...vertices` | [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)[] |

#### Returns

[`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:68

___

### edge

▸ **edge**(`...vertices`): [`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...vertices` | [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)[] |

#### Returns

[`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:68

___

### graph

▸ **graph**(`...edges`): [`Graph`](classes/Graph.md) & [`Typed`](interfaces/Typed.md)<typeof [`Graph`](classes/Graph.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...edges` | ([`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md) \| [`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md) \| [`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md)[] \| [`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md))[] |

#### Returns

[`Graph`](classes/Graph.md) & [`Typed`](interfaces/Typed.md)<typeof [`Graph`](classes/Graph.md)\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:225

___

### integral

▸ **integral**(`lowerBound`, `upperBound`): [`Integral`](classes/Integral.md) & [`Colorable`](interfaces/Colorable.md) & [`Typed`](interfaces/Typed.md)<`And`<typeof [`Integral`](classes/Integral.md), [`Colorable`](interfaces/Colorable.md)\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `lowerBound` | `number` |
| `upperBound` | `number` |

#### Returns

[`Integral`](classes/Integral.md) & [`Colorable`](interfaces/Colorable.md) & [`Typed`](interfaces/Typed.md)<`And`<typeof [`Integral`](classes/Integral.md), [`Colorable`](interfaces/Colorable.md)\>\>

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:122

___

### isAxis

▸ **isAxis**(`node`): node is Axis & Colorable & Scalable & Typed<And<And<typeof Axis, Colorable\>, Scalable\>\>

Returns true if the node passed is of renderable
type `"axis"`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`$Plottable`](modules.md#$plottable) |

#### Returns

node is Axis & Colorable & Scalable & Typed<And<And<typeof Axis, Colorable\>, Scalable\>\>

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:197

___

### isGraph

▸ **isGraph**(`node`): node is Graph & Typed<typeof Graph\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Twine` |

#### Returns

node is Graph & Typed<typeof Graph\>

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:248

___

### isIntegral

▸ **isIntegral**(`node`): node is Integral & Colorable & Typed<And<typeof Integral, Colorable\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`Weaver`](modules.md#weaver) |

#### Returns

node is Integral & Colorable & Typed<And<typeof Integral, Colorable\>\>

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:132

___

### isLink

▸ **isLink**(`node`): node is Link & Typed<typeof Link\> & Colorable

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md) \| [`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md) |

#### Returns

node is Link & Typed<typeof Link\> & Colorable

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:58

___

### isPlane

▸ **isPlane**(`node`): node is Plane & Typed<typeof Plane\> & Scalable

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Twine` |

#### Returns

node is Plane & Typed<typeof Plane\> & Scalable

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:56

___

### isPlot

▸ **isPlot**(`node`): node is Plot & Colorable & Typed<And<typeof Plot, Colorable\>\> & Scalable

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`$Plottable`](modules.md#$plottable) |

#### Returns

node is Plot & Colorable & Typed<And<typeof Plot, Colorable\>\> & Scalable

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:158

___

### isVertex

▸ **isVertex**(`node`): node is Vertex & Typed<typeof Vertex\> & Textual & Colorable

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md) \| [`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md) \| [`Edge`](classes/Edge.md) & [`Typed`](interfaces/Typed.md)<typeof [`Edge`](classes/Edge.md)\> & [`Colorable`](interfaces/Colorable.md) |

#### Returns

node is Vertex & Typed<typeof Vertex\> & Textual & Colorable

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:125

___

### link

▸ **link**(`source`, `target`): [`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md)

Creates a new [renderable link](modules.md#$link).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md) | A [renderable vertex](modules.md#$vertex). |
| `target` | [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md) | A [renderable vertex](modules.md#$vertex). |

#### Returns

[`Link`](classes/Link.md) & [`Typed`](interfaces/Typed.md)<typeof [`Link`](classes/Link.md)\> & [`Colorable`](interfaces/Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:52

___

### plane

▸ **plane**(`...children`): [`Plane`](classes/Plane.md) & [`Typed`](interfaces/Typed.md)<typeof [`Plane`](classes/Plane.md)\> & [`Scalable`](interfaces/Scalable.md)

Returns a new renderable [Plane](classes/Plane.md).
All renderable planes are:

1. [scalable](modules.md#scalable),
2. [typed](modules.md#typed) `"plane"`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...children` | [`$Plottable`](modules.md#$plottable)[] |

#### Returns

[`Plane`](classes/Plane.md) & [`Typed`](interfaces/Typed.md)<typeof [`Plane`](classes/Plane.md)\> & [`Scalable`](interfaces/Scalable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:46

___

### plot

▸ **plot**(`definition`): [`Plot`](classes/Plot.md) & [`Colorable`](interfaces/Colorable.md) & [`Typed`](interfaces/Typed.md)<`And`<typeof [`Plot`](classes/Plot.md), [`Colorable`](interfaces/Colorable.md)\>\> & [`Scalable`](interfaces/Scalable.md)

Creates a new renderable [Plot](classes/Plot.md).
All renderable plots are:

1. [scalable](modules.md#scalable).
2. [typed](modules.md#typed) `"plot"`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `definition` | `string` | The function’s [definition](classes/Plot.md#def). |

#### Returns

[`Plot`](classes/Plot.md) & [`Colorable`](interfaces/Colorable.md) & [`Typed`](interfaces/Typed.md)<`And`<typeof [`Plot`](classes/Plot.md), [`Colorable`](interfaces/Colorable.md)\>\> & [`Scalable`](interfaces/Scalable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/plot/plot.data.ts:148

___

### scalable

▸ **scalable**<`NodeType`\>(`nodetype`): `And`<`NodeType`, [`Scalable`](interfaces/Scalable.md)\>

Returns a scalable form of the provided nodetype.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `NodeType` | extends `Figure`<{}\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodetype` | `NodeType` |

#### Returns

`And`<`NodeType`, [`Scalable`](interfaces/Scalable.md)\>

#### Defined in

ui/vtex/src/lib/weave/warp/scalable.ts:54

___

### textual

▸ **textual**<`NodeType`\>(`nodetype`): `And`<`NodeType`, [`Textual`](interfaces/Textual.md)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `NodeType` | extends `Figure`<{}\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodetype` | `NodeType` |

#### Returns

`And`<`NodeType`, [`Textual`](interfaces/Textual.md)\>

#### Defined in

ui/vtex/src/lib/weave/warp/textual.ts:57

___

### typed

▸ **typed**<`NodeType`\>(`nodetype`): `And`<`NodeType`, [`Typed`](interfaces/Typed.md)<`NodeType`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `NodeType` | extends `Figure`<{}\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodetype` | `NodeType` |

#### Returns

`And`<`NodeType`, [`Typed`](interfaces/Typed.md)<`NodeType`\>\>

#### Defined in

ui/vtex/src/lib/weave/warp/typed.ts:18

___

### v

▸ **v**(`value`): [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` \| `number` |

#### Returns

[`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:121

___

### vertex

▸ **vertex**(`value`): [`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` \| `number` |

#### Returns

[`Vertex`](classes/Vertex.md) & [`Typed`](interfaces/Typed.md)<typeof [`Vertex`](classes/Vertex.md)\> & [`Textual`](interfaces/Textual.md) & [`Colorable`](interfaces/Colorable.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:121
