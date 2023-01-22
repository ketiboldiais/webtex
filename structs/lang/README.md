# @webtex/lang
This is the parsers module used in Webtex. There are several parsers in this repository.

## `PRex`
The `PRex` directory contains a _recursive descent parser_, _compiler_, and _virtual machine_. Webtex interprets source code with this module.

## `PCox`
The `PCox` directory contains _parser combinators_. Webtex uses these combinators primarily for testing. The parser combinators should not be used to handle actual user inputs. Given how fast a user may type and the amount of memory consumed by the parser combinators, the `PCox` parsers are not well-suited for real-time text editing.

## `PRat`
The `PRat` directory contains _packrat parsers_. Like the `PCox` parsers, these parsers are used primarily for testing/prototyping. Unlike the `PCox` parsers, the `PRat` parsers have very limited error-handling ability, leading to a tendency of hiding ambiguities under the rug. The smaller error-handling API, however, makes these parsers much easier and faster to work with.

