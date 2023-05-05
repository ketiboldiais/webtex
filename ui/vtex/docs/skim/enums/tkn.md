[@webtex/vtex](../README.md) / [Exports](../modules.md) / tkn

# Enumeration: tkn

## Table of contents

### Enumeration Members

- [ampersand](tkn.md#ampersand)
- [and](tkn.md#and)
- [bang](tkn.md#bang)
- [binary](tkn.md#binary)
- [caret](tkn.md#caret)
- [class](tkn.md#class)
- [def](tkn.md#def)
- [deq](tkn.md#deq)
- [div](tkn.md#div)
- [do](tkn.md#do)
- [dot](tkn.md#dot)
- [else](tkn.md#else)
- [eof](tkn.md#eof)
- [eq](tkn.md#eq)
- [error](tkn.md#error)
- [false](tkn.md#false)
- [float](tkn.md#float)
- [for](tkn.md#for)
- [frac](tkn.md#frac)
- [geq](tkn.md#geq)
- [goto](tkn.md#goto)
- [gt](tkn.md#gt)
- [hex](tkn.md#hex)
- [if](tkn.md#if)
- [in](tkn.md#in)
- [inf](tkn.md#inf)
- [int](tkn.md#int)
- [is](tkn.md#is)
- [left\_brace](tkn.md#left_brace)
- [left\_bracket](tkn.md#left_bracket)
- [left\_paren](tkn.md#left_paren)
- [leq](tkn.md#leq)
- [let](tkn.md#let)
- [lt](tkn.md#lt)
- [minus](tkn.md#minus)
- [mod](tkn.md#mod)
- [nan](tkn.md#nan)
- [nand](tkn.md#nand)
- [neq](tkn.md#neq)
- [nil](tkn.md#nil)
- [nor](tkn.md#nor)
- [not](tkn.md#not)
- [null](tkn.md#null)
- [octal](tkn.md#octal)
- [or](tkn.md#or)
- [percent](tkn.md#percent)
- [plus](tkn.md#plus)
- [rem](tkn.md#rem)
- [return](tkn.md#return)
- [right\_brace](tkn.md#right_brace)
- [right\_bracket](tkn.md#right_bracket)
- [right\_paren](tkn.md#right_paren)
- [scinum](tkn.md#scinum)
- [semicolon](tkn.md#semicolon)
- [skip](tkn.md#skip)
- [slash](tkn.md#slash)
- [star](tkn.md#star)
- [string](tkn.md#string)
- [super](tkn.md#super)
- [symbol](tkn.md#symbol)
- [this](tkn.md#this)
- [to](tkn.md#to)
- [true](tkn.md#true)
- [vbar](tkn.md#vbar)
- [while](tkn.md#while)
- [xnor](tkn.md#xnor)
- [xor](tkn.md#xor)

## Enumeration Members

### ampersand

• **ampersand** = ``13``

Lexeme: `&`

#### Defined in

skim.ts:1606

___

### and

• **and** = ``36``

#### Defined in

skim.ts:1727

___

### bang

• **bang** = ``20``

Lexeme: `!`

#### Defined in

skim.ts:1641

___

### binary

• **binary** = ``33``

#### Defined in

skim.ts:1723

___

### caret

• **caret** = ``15``

Lexeme: `^`

#### Defined in

skim.ts:1616

___

### class

• **class** = ``37``

#### Defined in

skim.ts:1728

___

### def

• **def** = ``53``

#### Defined in

skim.ts:1744

___

### deq

• **deq** = ``25``

Lexeme: `==`

#### Defined in

skim.ts:1666

___

### div

• **div** = ``66``

#### Defined in

skim.ts:1757

___

### do

• **do** = ``60``

#### Defined in

skim.ts:1751

___

### dot

• **dot** = ``12``

Lexeme: `.`

#### Defined in

skim.ts:1601

___

### else

• **else** = ``38``

#### Defined in

skim.ts:1729

___

### eof

• **eof** = ``1``

Lexeme: `""`
Utility token indicating
the end-of-input.

#### Defined in

skim.ts:1543

___

### eq

• **eq** = ``26``

Lexeme: `=`

#### Defined in

skim.ts:1671

___

### error

• **error** = ``2``

Lexeme: _Error message_.
Utility token indicating
an error occurred during scanning.
See also [errorToken](../classes/Engine.md#errortoken).

#### Defined in

skim.ts:1551

___

### false

• **false** = ``57``

#### Defined in

skim.ts:1748

___

### float

• **float** = ``28``

Token type integer.
- Lexeme: Any `float`, `+float`, or `-float`.
- Guard: tknIsFloat

_Reference_.
1. _See also_ [NUMBER](../classes/Engine.md#number)
2. _See also_ floatingPointNumber (demonstrating
how floating point numbers are parsed).

#### Defined in

skim.ts:1695

___

### for

• **for** = ``39``

#### Defined in

skim.ts:1730

___

### frac

• **frac** = ``30``

Token type fraction.
- Lexeme: Any `frac`, `+frac`, or `-frac`.
- Guard: tknIsFrac

_Reference_.
1. _See also_ fractionalNumber (demonstrating
how fractional numbers are parsed).

#### Defined in

skim.ts:1720

___

### geq

• **geq** = ``21``

Lexeme: `>=`

#### Defined in

skim.ts:1646

___

### goto

• **goto** = ``61``

#### Defined in

skim.ts:1752

___

### gt

• **gt** = ``22``

Lexeme: `>`

#### Defined in

skim.ts:1651

___

### hex

• **hex** = ``31``

#### Defined in

skim.ts:1721

___

### if

• **if** = ``40``

#### Defined in

skim.ts:1731

___

### in

• **in** = ``55``

#### Defined in

skim.ts:1746

___

### inf

• **inf** = ``59``

#### Defined in

skim.ts:1750

___

### int

• **int** = ``27``

Token type integer.
- Lexeme: Any `int`, `+int`, or `-int`.
- Guard: tknIsInt

_References_
1. _See also_ [NUMBER](../classes/Engine.md#number)
2. _See also_ integer
2. _See also_ integer_integer

#### Defined in

skim.ts:1683

___

### is

• **is** = ``48``

#### Defined in

skim.ts:1739

___

### left\_brace

• **left\_brace** = ``7``

Lexeme: `{`

#### Defined in

skim.ts:1576

___

### left\_bracket

• **left\_bracket** = ``5``

Lexeme: `[`

#### Defined in

skim.ts:1566

___

### left\_paren

• **left\_paren** = ``3``

Lexeme: `(`

#### Defined in

skim.ts:1556

___

### leq

• **leq** = ``23``

Lexeme: `<=`

#### Defined in

skim.ts:1656

___

### let

• **let** = ``52``

#### Defined in

skim.ts:1743

___

### lt

• **lt** = ``24``

Lexeme: `<`

#### Defined in

skim.ts:1661

___

### minus

• **minus** = ``10``

Lexeme: `-`

#### Defined in

skim.ts:1591

___

### mod

• **mod** = ``65``

#### Defined in

skim.ts:1756

___

### nan

• **nan** = ``58``

#### Defined in

skim.ts:1749

___

### nand

• **nand** = ``43``

#### Defined in

skim.ts:1734

___

### neq

• **neq** = ``19``

Lexeme: `!=`

#### Defined in

skim.ts:1636

___

### nil

• **nil** = ``0``

Lexeme: `""`
Utility token for initializing
[CurrentToken](../classes/Engine.md#currenttoken) and
[LastToken](../classes/Engine.md#lasttoken).

#### Defined in

skim.ts:1536

___

### nor

• **nor** = ``44``

#### Defined in

skim.ts:1735

___

### not

• **not** = ``47``

#### Defined in

skim.ts:1738

___

### null

• **null** = ``41``

#### Defined in

skim.ts:1732

___

### octal

• **octal** = ``32``

#### Defined in

skim.ts:1722

___

### or

• **or** = ``42``

#### Defined in

skim.ts:1733

___

### percent

• **percent** = ``16``

Lexeme: `%`

#### Defined in

skim.ts:1621

___

### plus

• **plus** = ``9``

Lexeme: `+`

#### Defined in

skim.ts:1586

___

### rem

• **rem** = ``64``

#### Defined in

skim.ts:1755

___

### return

• **return** = ``49``

#### Defined in

skim.ts:1740

___

### right\_brace

• **right\_brace** = ``8``

Lexeme: `}`

#### Defined in

skim.ts:1581

___

### right\_bracket

• **right\_bracket** = ``6``

Lexeme: `]`

#### Defined in

skim.ts:1571

___

### right\_paren

• **right\_paren** = ``4``

Lexeme: `)`

#### Defined in

skim.ts:1561

___

### scinum

• **scinum** = ``29``

Token type scinum. Note that Skim only recognizes
scientific numbers prefaced with an uppercase `E`.

- Lexeme: Any `scinum`, `+scinum`, or `-scinum`.
- Guard: tknIsScinum

_Reference_.
1. _See also_ [NUMBER](../classes/Engine.md#number)
2. _See also_ scientificNumber (demonstrating
how scientific numbers are parsed).

#### Defined in

skim.ts:1709

___

### semicolon

• **semicolon** = ``18``

Lexeme: `;`

#### Defined in

skim.ts:1631

___

### skip

• **skip** = ``62``

#### Defined in

skim.ts:1753

___

### slash

• **slash** = ``17``

Lexeme: `/`

#### Defined in

skim.ts:1626

___

### star

• **star** = ``11``

Lexeme: `*`

#### Defined in

skim.ts:1596

___

### string

• **string** = ``34``

#### Defined in

skim.ts:1724

___

### super

• **super** = ``50``

#### Defined in

skim.ts:1741

___

### symbol

• **symbol** = ``35``

#### Defined in

skim.ts:1725

___

### this

• **this** = ``51``

#### Defined in

skim.ts:1742

___

### to

• **to** = ``63``

#### Defined in

skim.ts:1754

___

### true

• **true** = ``56``

#### Defined in

skim.ts:1747

___

### vbar

• **vbar** = ``14``

Lexeme: `|`

#### Defined in

skim.ts:1611

___

### while

• **while** = ``54``

#### Defined in

skim.ts:1745

___

### xnor

• **xnor** = ``46``

#### Defined in

skim.ts:1737

___

### xor

• **xor** = ``45``

#### Defined in

skim.ts:1736
