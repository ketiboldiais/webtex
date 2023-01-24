# @webtex/lang
This is the parsers module used in Webtex. There are several parsers in this repository.

## `PRex`
The `PRex` directory contains a _recursive descent parser_, _compiler_, and _virtual machine_. Webtex interprets source code with this module.

## `PCox`
The `PCox` directory contains _parser combinators_. These parsers are used by the primary parser, `PRex`, to parse algebraic expressions. Algebraic expressions are parsed by the smaller `PCox` parsers to maintain separation of concern. Because algebraic expressions are considered data, they are handled by separate parsers.

## `PRat`
The `PRat` directory contains _packrat parsers_. These parsers handle some ambiguous algebraic expressions (those whose grammar aren’t necessarily context-free) that the `PCox` parsers cannot handle.

