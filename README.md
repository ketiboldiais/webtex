# Webtex Monorepo
This is the root directory for the Webtex monorepo. All of Webtex's packages are ESM-only. For development details, [_see_ Development](#development).

## Outline
This section outlines the subdirectories and packages used by Webtex.

### Subdirectory: `apps`
Contains Webtex's major components.

| Package          | Subdirectory | Description                                                                           |
| ---------------- | ------------ | ------------------------------------------------------------------------------------- |
| `@webtex/client` | `client`     | Webtex's frontend, a React application built with Vite.                               |
| `@webtex/server` | `server`     | Webtex's backend, an Express server.                                                  |
| `@webtex/lib`    | `lib`        | Utility functions shared between `@webtex/client` and `@webtex/server`.               |
| `@webtex/shared` | `shared`     | Type definitions and interfaces shared between `@webtex/client` and `@webtex/server`. |

### Subdirectory: `structs`
Contains various data structures used by Webtex.

| Package            | Subdirectory | Description                                                                                                               |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `@webtex/bintree`  | `bintree`    | Binary search tree, used as an auxiliary structure for the `IndexedDB` component of the Redux component on the front end. |
| `@webtex/bsql`     | `bsql`       | In development. Expected to be used as a further abstraction for the `IndexedDB` interface.                               |
| `@webtex/list`     | `list`       | Doubly-linked list, used as an auxiliary structure for queueuing certain operations on the frontend.                      |
| `@webtex/machines` | `machines`   | Various build systems for testing.                                                                                        |

### Subdirectory: `utils`
Contains utility methods used by packages in `apps` and `structs`.

| Package          | Subdirectory | Description                                                                            |
| ---------------- | ------------ | -------------------------------------------------------------------------------------- |
| `@webtex/file`   | `file`       | Some abstractions for Node's `fs` functions because of the lack of `__dirname` in ESM. |
| `@webtex/math`   | `math`       | Various mathematical methods.                                                          |
| `@webtex/string` | `string`     | Various string methods.                                                                |

## Development
All development and testing over a network is done with Caddy for automatic HTTPS. _See_ [Caddy's Documentation for more details.](https://caddyserver.com/docs/) Because domain names are preconfigured, in development, the system's `hosts` file must be edited to resolve `webtex.cloud` and `api.webtex.cloud` to the local host IP.

The Webtex server uses Redis for cache management. Accordingly, for any given development pipeline, the Redis server must finish starting before the server starts. Because the client and the server are completely decoupled, they're free to run concurrently. Depending on the development pipeline and recent caching, the server may run faster and boot before Caddy. Accordingly, development is done with `tmux`, preconfigured with the `webtex.yml` file. The `webtex.yml` contains a command `js`. This is a Bash alias for `pnpm`. For more details on `tmux`, [_see_ the tmux documentation](https://tmuxguide.readthedocs.io/en/latest/tmux/tmux.html). For a `tmux` session manager, [_see_ tmuxinator](https://github.com/tmuxinator/tmuxinator).
