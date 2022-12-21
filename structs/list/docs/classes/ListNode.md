[@webtex/list](../README.md) / [Exports](../modules.md) / ListNode

# Class: ListNode<T\>

Implements the nodes used by `List`. All `ListNode` instances
have three properties, `data`, `next`, and `prev`.
The `data` property takes a generic type. The `next`
and `prev` properties are akin to pointers;
They take either `null` or a `ListNode` of the
same generic type.

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](ListNode.md#constructor)

### Properties

- [data](ListNode.md#data)
- [next](ListNode.md#next)
- [prev](ListNode.md#prev)

## Constructors

### constructor

• **new ListNode**<`T`\>(`data`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `T` |

#### Defined in

[index.ts:36](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L36)

## Properties

### data

• **data**: `T`

The data stored stored the `ListNode`
instance. Data may be of any type.

#### Defined in

[index.ts:22](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L22)

___

### next

• **next**: ``null`` \| [`ListNode`](ListNode.md)<`T`\> = `null`

Pointer to the next element.
Manipulating this property directly
may break the overall list.

#### Defined in

[index.ts:28](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L28)

___

### prev

• **prev**: ``null`` \| [`ListNode`](ListNode.md)<`T`\> = `null`

Pointer to the previous element.
Like the `next` pointer, manipulating
this property directly may break
the overall list.

#### Defined in

[index.ts:35](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L35)
