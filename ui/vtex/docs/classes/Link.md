[@webtex/vtex](../README.md) / [Exports](../modules.md) / Link

# Class: Link

## Table of contents

### Constructors

- [constructor](Link.md#constructor)

### Properties

- [source](Link.md#source)
- [target](Link.md#target)

### Methods

- [sourceMap](Link.md#sourcemap)
- [targetMap](Link.md#targetmap)

## Constructors

### constructor

• **new Link**(`source`, `target`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md) |
| `target` | [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md) |

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:19

## Properties

### source

• **source**: [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)

The link’s source node. This node
must be a [renderable node](../modules.md#$vertex).

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:13

___

### target

• **target**: [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)

The link’s target node. This node
must be a [renderable node](../modules.md#$vertex).

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:18

## Methods

### sourceMap

▸ **sourceMap**(`f`): [`Link`](Link.md)

Sets the link’s source node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`sourceNode`: [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)) => [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md) |

#### Returns

[`Link`](Link.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:30

___

### targetMap

▸ **targetMap**(`f`): [`Link`](Link.md)

Sets the link’s source node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`targetNode`: [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)) => [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md) |

#### Returns

[`Link`](Link.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:41
