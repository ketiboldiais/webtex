[@webtex/list](../README.md) / [Exports](../modules.md) / List

# Class: List<T\>

Implements the doubly-linked list.

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](List.md#constructor)

### Properties

- [\_head](List.md#_head)
- [\_length](List.md#_length)
- [\_tail](List.md#_tail)

### Methods

- [[iterator]](List.md#[iterator])
- [addFirst](List.md#addfirst)
- [addLast](List.md#addlast)
- [array](List.md#array)
- [hasDuplicate](List.md#hasduplicate)
- [head](List.md#head)
- [isEmpty](List.md#isempty)
- [iterator](List.md#iterator)
- [length](List.md#length)
- [tail](List.md#tail)

## Constructors

### constructor

• **new List**<`T`\>(`...data`)

Constructs a `List`.

**`Example`**

```typescript
const L = new List(1,2,3,4);
// L is the doubly-linked list (1,2,3,4).
```
Generic types can be provided:
```typescript
const L = new List<{name: string}>({name: 'Sano'}, {name: 'Jenny'});
// L is the doubly-linked list ({name: 'Sano'}, {name: 'Jenny'});
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...data` | `T`[] |

#### Defined in

[index.ts:72](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L72)

## Properties

### \_head

• `Private` **\_head**: ``null`` \| [`ListNode`](ListNode.md)<`T`\>

Stores the list's head (i.e.,
the first element of the list.)

#### Defined in

[index.ts:50](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L50)

___

### \_length

• `Private` **\_length**: `number`

#### Defined in

[index.ts:56](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L56)

___

### \_tail

• `Private` **\_tail**: ``null`` \| [`ListNode`](ListNode.md)<`T`\>

Stores the list's tail (i.e.,
the last element of the list).

#### Defined in

[index.ts:55](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L55)

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<`T`\>

#### Returns

`IterableIterator`<`T`\>

#### Defined in

[index.ts:229](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L229)

___

### addFirst

▸ **addFirst**(`item`, `unique?`): [`List`](List.md)<`T`\>

Adds an element to the head of the list.

**`Example`**

```typescript
const L = list(1,2,3,4);
L.addFirst(0);
// L is now (0,1,2,3,4);
```

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `item` | `T` | `undefined` |
| `unique` | `boolean` | `false` |

#### Returns

[`List`](List.md)<`T`\>

#### Defined in

[index.ts:128](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L128)

___

### addLast

▸ **addLast**(`item`, `unique?`): [`List`](List.md)<`T`\>

Adds an element to the end of the list.

**`Example`**

```typescript
const L = list(1,2,3,4);
L.add(5);
// L is (1,2,3,4,5)
```

**`Example`**

```typescript
const L = list(1,2,3,4);
L.add(1, true);
// L is (1,2,3,4);
L.add(1);
// L is (1,2,3,4,1);
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `item` | `T` | `undefined` | The list item to include. List items can be arbitrarily complex. |
| `unique` | `boolean` | `false` | If `true`, the item is inserted only if it doesn't exist in the list already. If `false`, the item is inserted whether or not it already exists in the list. I.e., if `true`, guard against duplicates, if `false` don't bother. Defaults to `false`. |

#### Returns

[`List`](List.md)<`T`\>

#### Defined in

[index.ts:162](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L162)

___

### array

▸ **array**(): `T`[]

Returns the list as a plain JavaScript array.
If the list is empty, returns an empty array.

**`Example`**

```typescript
const A = list(1,2,3,4);
const B = A.array();
// B is [1,2,3,4]
```

#### Returns

`T`[]

#### Defined in

[index.ts:184](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L184)

___

### hasDuplicate

▸ **hasDuplicate**(`element`): `boolean`

Returns `true` if the list contains
a duplicate, and `false` otherwise.
Uses Node's `deepEqual` algorithm to
check for equality.

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `T` |

#### Returns

`boolean`

#### Defined in

[index.ts:214](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L214)

___

### head

▸ **head**(): ``null`` \| `T`

Returns the first item of the list. If the list is empty, returns null.

**`Example`**

```typescript
const A = list(1,2,3,4);
const B = list.head();
// B is 1
```

#### Returns

``null`` \| `T`

#### Defined in

[index.ts:87](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L87)

___

### isEmpty

▸ **isEmpty**(): `boolean`

Returns `true` if the list
is empty, `false` otherwise.
$O$(1) operation.

#### Returns

`boolean`

#### Defined in

[index.ts:204](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L204)

___

### iterator

▸ **iterator**(): `IterableIterator`<`T`\>

#### Returns

`IterableIterator`<`T`\>

#### Defined in

[index.ts:191](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L191)

___

### length

▸ **length**(): `number`

Returns the length of the list.
All `List` instances start at length
`0`, increment at each newly inserted element,
and decrement at each removed element.

#### Returns

`number`

#### Defined in

[index.ts:115](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L115)

___

### tail

▸ **tail**(): ``null`` \| `T`

Returns the last item of the list. If the list is empty, returns null.

**`Example`**

```typescript
const A = list(1,2,3,4);
const B = A.tail();
// B is 4
```

#### Returns

``null`` \| `T`

#### Defined in

[index.ts:102](https://github.com/ketiboldiais/webtex/blob/cf78d78/structs/list/src/index.ts#L102)
