[@webtex/vtex](../README.md) / [Exports](../modules.md) / Typed

# Interface: Typed<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Figure` |

## Table of contents

### Properties

- [type](Typed.md#type)

### Methods

- [isType](Typed.md#istype)
- [typed](Typed.md#typed)

## Properties

### type

• **type**: `FigType`

The type name for this renderable node.

#### Defined in

ui/vtex/src/lib/weave/warp/typed.ts:3

## Methods

### isType

▸ **isType**(`name`): this is InstanceType<T\>

Returns true if this renderable node
is of the provided type.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `FigType` |

#### Returns

this is InstanceType<T\>

#### Defined in

ui/vtex/src/lib/weave/warp/typed.ts:15

___

### typed

▸ **typed**(`name`): [`Typed`](Typed.md)<`T`\>

Sets the [type](Typed.md#type) for this
renderable node. Once set, this value
cannot be changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `FigType` |

#### Returns

[`Typed`](Typed.md)<`T`\>

#### Defined in

ui/vtex/src/lib/weave/warp/typed.ts:9
