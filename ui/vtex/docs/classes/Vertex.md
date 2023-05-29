[@webtex/vtex](../README.md) / [Exports](../modules.md) / Vertex

# Class: Vertex

## Hierarchy

- `SimulationNodeDatum`

  ↳ **`Vertex`**

## Table of contents

### Constructors

- [constructor](Vertex.md#constructor)

### Properties

- [data](Vertex.md#data)
- [fx](Vertex.md#fx)
- [fy](Vertex.md#fy)
- [id](Vertex.md#id)
- [index](Vertex.md#index)
- [radius](Vertex.md#radius)
- [vx](Vertex.md#vx)
- [vy](Vertex.md#vy)
- [x](Vertex.md#x)
- [y](Vertex.md#y)

### Methods

- [neighbors](Vertex.md#neighbors)
- [r](Vertex.md#r)
- [uid](Vertex.md#uid)

## Constructors

### constructor

• **new Vertex**(`data`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |

#### Inherited from

SimulationNodeDatum.constructor

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:107

## Properties

### data

• **data**: `string`

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:97

___

### fx

• `Optional` **fx**: ``null`` \| `number`

Node’s fixed x-position (if position was fixed)

#### Inherited from

SimulationNodeDatum.fx

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:52

___

### fy

• `Optional` **fy**: ``null`` \| `number`

Node’s fixed y-position (if position was fixed)

#### Inherited from

SimulationNodeDatum.fy

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:56

___

### id

• **id**: `string`

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:98

___

### index

• `Optional` **index**: `number`

Node’s zero-based index into nodes array. This property is set during the initialization process of a simulation.

#### Inherited from

SimulationNodeDatum.index

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:32

___

### radius

• **radius**: `number` = `5`

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:99

___

### vx

• `Optional` **vx**: `number`

Node’s current x-velocity

#### Inherited from

SimulationNodeDatum.vx

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:44

___

### vy

• `Optional` **vy**: `number`

Node’s current y-velocity

#### Inherited from

SimulationNodeDatum.vy

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:48

___

### x

• `Optional` **x**: `number`

Node’s current x-position

#### Inherited from

SimulationNodeDatum.x

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:36

___

### y

• `Optional` **y**: `number`

Node’s current y-position

#### Inherited from

SimulationNodeDatum.y

#### Defined in

node_modules/.pnpm/@types+d3-force@3.0.4/node_modules/@types/d3-force/index.d.ts:40

## Methods

### neighbors

▸ **neighbors**(`...vertices`): [`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `...vertices` | [`Vertex`](Vertex.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Vertex`](Vertex.md)\> & [`Textual`](../interfaces/Textual.md) & [`Colorable`](../interfaces/Colorable.md)[] |

#### Returns

[`Link`](Link.md) & [`Typed`](../interfaces/Typed.md)<typeof [`Link`](Link.md)\> & [`Colorable`](../interfaces/Colorable.md)[]

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:115

___

### r

▸ **r**(`value`): [`Vertex`](Vertex.md)

Sets the vertex’s radius.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Vertex`](Vertex.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:103

___

### uid

▸ **uid**(`value`): [`Vertex`](Vertex.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Vertex`](Vertex.md)

#### Defined in

ui/vtex/src/lib/weave/weft/graph/graph.data.ts:111
