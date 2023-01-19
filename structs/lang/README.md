# @webtex/lang
This is the parsers module used in Webtex. There are several parsers in this repository.

## `PCox`
The `PCox` directory contains _parser combinators_. Webtex uses these combinators for prototyping and testing. The parser combinators should not be used to handle actual user inputs. Given how fast a user may type and the amount of memory consumed by parser combinators, the `PCox` parsers are not well-suited for real-time text editing.

## `PRex`
The `PRex` directory contains a _handwritten recursive descent parser_. This is the parser used for Webtex’s real-time editing. The parser is specifically designed for Webtex’s text editor.

## `PRat`
The `PRat` directory contains a _packrat parser_. Like the `PCox` parsers, this parser is used primarily for testing and prototyping.

