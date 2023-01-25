# @webtex/lang
This is the parsers module used in Webtex. There are several parsers in this repository.

## `prex`
The `prex` directory contains a _recursive descent parser_ and _interpreter_. Webtex interprets source code with this module.

## `pcox`
The `pcox` directory contains _parser combinators_. These parsers are used by the primary parser, `prex`, to parse algebraic expressions. Algebraic expressions are parsed by the smaller `pcox` parsers to maintain separation of concern. Because algebraic expressions are considered data, they are handled by separate parsers.

## `prat`
The `prat` directory contains _packrat parsers_. These parsers handle some ambiguous algebraic expressions (those whose grammars aren’t necessarily context-free) that the `pcox` parsers cannot handle.

## `pcan`
The `pcan` directory contains various helper functions and modules for parsing and manipulating algebraic expressions and numerics.

