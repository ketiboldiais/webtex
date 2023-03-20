# Webtex Monorepo
This is the root directory for the Webtex monorepo. All of Webtex's packages are ESM-only. For development details, [_see_ Development](#development).

## Outline
This section outlines the subdirectories and packages used by Webtex.

### Subdirectory: `apps`
Contains Webtex's major components.

#### @webtex/client
- Webtex's frontend, a React application via Vite.

#### @webtex/server
- Webtex's backend, via Express server.

#### @webtex/lib
- Utility functions shared between `@webtex/client` and `@webtex/server`.

#### @webtex/shared
- Type definitions and interfaces shared between `@webtex/client` and `@webtex/server`.


### Subdirectory: `structs`
Contains various data structures used by Webtex.

### Subdirectory: `utils`
Contains utility methods used by packages in `apps` and `structs`.


## Development
All development and testing over a network is done with Caddy for automatic HTTPS. Because domain names are preconfigured, in development, the system's `hosts` file must be edited to resolve `webtex.cloud` and `api.webtex.cloud` to the local host IP. The `Caddy run` command expects there to be a Caddy configuration file in the root directory. _See_ [Caddy's Documentation for more details.](https://caddyserver.com/docs/) 

The Webtex server uses Redis for cache management. Accordingly, for any given development pipeline, the Redis server must finish starting before the server starts. Because the client and the server are completely decoupled, they're free to run concurrently. Caddy, however, will run faster than either the client or the server. Accordingly, development is done with `tmux`, preconfigured with the `webtex.yml` file. The `webtex.yml` contains a command `js`. This is a Bash alias for `pnpm`. For more details on `tmux`, [_see_ the tmux documentation](https://tmuxguide.readthedocs.io/en/latest/tmux/tmux.html). For a `tmux` session manager, [_see_ tmuxinator](https://github.com/tmuxinator/tmuxinator).

## Algom
The Webtex editor uses a small scripting language called Algom to parse mathematical expressions. _See_ the `client/`