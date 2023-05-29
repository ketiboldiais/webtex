@webtex/vtex / [Exports](modules.md)

# Webtex Monorepo
This is the root directory for the Webtex monorepo. All of Webtex's packages are ESM-only.

## Overview
Webtex is a note-taking application geared towards technical subjects. Rich text-editing is done through Lexical, global state management through Redux, local data persistence through IndexedDB, and UI through React. A previous version of Webtex (viewable on the `main` branch) used an Express backend for data persistence. Because of security-related issues stemming from Webtex’s built-in compiler, that approach has been put on hold indefinitely.

## Subcomponents
The following sections outline Webtex subcomponents. Because Webtex attempts to reuse components as much as possible while maintaining type-safety, many of the subcomponents are designed with (1) Webtex’s overall architecture in mind, and (2) the fact that there are several "DOMs" at play —the native DOM, React’s DOM, and the Lexical editor’s DOM. All together, such high reusability entails potentially steep technical debt. To mitigate that risk, many of Webtex’s subcomponents are implemented from scratch rather than using existing libraries. That said, Webtex’s major UI-related dependencies include:

1. D3
2. ThreeJS
3. Katex
4. Excalidraw

### Algom
Webtex uses a custom language called Algom for handling certain user inputs. Designed specifically for Webtex, user inputs are fed to the Algom compiler where they are ultimately compiled to either (a) JavaScript functions executing only within the Algom namespace, or (b) plain JavaScript values to be consumed by the relevant React component. A few components that use Algom:

1. The various plotter components—Plot2d, Plot3d, PlotParametric, PlotPolar—all use Algom to handle user inputs.
2. The Sheet component uses Algom to evaluate mathematical expressions, loops, and recursive functions.
3. The LatexEditor and DataTable components use Algom to transform user input expressions into Latex, to be rendered by Katex.

### StringFn

### Helper Components
#### Fig
| Dependencies | Description |
| ------------ | ----------- |
| None         |             |

The `Fig` component provides a resizable `div` element. While there are several React-resizer libraries, Webtex requires more stringent control over the DOM to maintain proper data flow to the editor.
