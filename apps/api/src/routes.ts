/**
 * @description Root route
 * - NO CLIENT SIDE ACCESS.
 * - This is the root route.
 * - This should only be used by the server.
 */
export const ROOT = "/";

// FIXME - the base route for deployment
/**
 * @description Base URL for the server.
 */
export const BASE = "http://localhost:5174";

/**
 * @summary `base/auth` endpoint.
 * - `POST /auth` Registers a user.
 * - `GET /auth` Logs in a user.
 * - `PATCH /auth` Gets a refresh token.
 * - `DELETE /auth` Logs out a user.
 * @access public `POST /auth`
 * @access private `GET /auth`
 * @access private `PATCH /auth`
 * @access private `DELETE /auth`
 * @description
 * - Rate limited route.
 * - All requests except `POST /auth` require:
 *     1. `email: string`
 *     2. `password: string`
 *     3. `jwt` (httpOnly)
 *     4. `user` (hash)
 *     5. `accessToken: string`
 * - `POST /auth` only requires an `email` and `password`.
 * - If any of the fields are missing, an error status code is returned.
 * - The server _only_ returns status 400.
 * - No messages are returned.
 * - Only `POST /auth` is accessible to unverified accounts.
 */
export const AUTH = "/auth";

/**
 * @summary `base/user` endpoints
 * - `DELETE /user` Deletes user account.
 * - `PUT /user` Patches user email.
 * - `PATCH /user` Updates user password.
 * @access private `DELETE /user`
 * @access private `PUT /user`
 * @access private `PATCH /user`
 * @description
 * - Rate limited route.
 * - Each of these are high-sensitivity actions.
 * - All requests to `/user` require:
 *     1. `email: string`
 *     2. `password: string`
 *     3. `jwt: string` (httpOnly)
 *     4. `user: string`
 *     5. `accessToken: string`
 * - Not accessible to unverified accounts.
 */
export const USER = "/user";

/**
 * @description base/notes endpoint.
 * - `POST /notes` Saves a note.
 * - `GET /notes` Returns all the user's notes.
 * - `PATCH /notes` Updates a user's existing note.
 * - `DELETE /notes` Deletes a note.
 * @private `POST /notes`
 * @private `GET /notes`
 * @private `DELETE /notes`
 * @summary
 * - All routes require:
 *     1. `email: string`
 *     2. `password: string`
 *     3. `user` (hash)
 *     4. `accessToken: string`
 * - Not accessible to unverified accounts.
 * @private
 */
export const NOTES = "/notes";
