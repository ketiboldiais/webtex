# @webtex/lang
This is the parsers module used in Webtex. There are several parsers in this repository.

## `prx`
The `prx` directory contains a _recursive descent parser_ and _interpreter_. Both these modules are the editor’s primary drivers.

## `pcx`
The `pcx` directory contains _parser combinators_. These parsers are used by the primary parser, `prx`, to parse algebraic expressions. Algebraic expressions are parsed by the smaller `pcx` (and `pkt`) parsers to maintain separation of concerns. Because algebraic expressions are largely treated as data, they are handled by separate parsers.

## `pkt`
The `pkt` directory contains _packrat parsers_. These parsers handle some ambiguous algebraic expressions (those whose grammars aren’t necessarily context-free) that the `pcx` parsers cannot handle. The `pkt` parsers perform the brunt of the parsing.

