/*
 * @description Root domain
 */
export const ROOT_DOMAIN = "https://webtex.cloud";

/**
 * @description Root route
 * @access private
 * - This is the root route.
 * - This should only be used by the server.
 */
export const ROOT = "/";

// FIXME - change the base route before deployment
/**
 * @description Base URL for the server.
 */
export const BASE = "https://api.webtex.cloud";

/**
 * @summary `base/auth` endpoint.
 * - `POST /auth` Registers a user.
 * @access public `POST /auth`
 * @description
 * - Rate limited route.
 * - `POST /auth` only requires an `email` and `password`.
 * - If any of the fields are missing, an error status code is returned.
 * - The server _only_ returns status 400.
 * - No messages are returned.
 * - Only `POST /auth` is accessible to unverified accounts.
 */
export const AUTH = "/auth";

/**
 * @summary `base/user` endpoints
 * - `POST /user` logs in to account.
 * @description
 * - Rate limited route.
 * - Not accessible to unverified accounts.
 */
export const USER = "/user";

/**
 * @description base/session endpoint.
 * - `POST /session` Gets refresh token.
 * - `DELETE /session` Logs out user.
 */
export const SESSION = "/session";

/**
 * @description base/confirm endpoint.
 * - `GET /confirm/OTP` sends OTP confirmation
 */
export const VERIFY = "/confirmation/";

/**
 * @description base/notes endpoint.
 * - `POST /notes` Saves a note.
 * - `GET /notes` Returns all the user's notes.
 * - `PATCH /notes` Updates a user's existing note.
 * - `DELETE /notes` Deletes a note.
 * @private `POST /notes`
 * @private `GET /notes`
 * @private `PATCH /notes`
 * @private `DELETE /notes`
 * - Not accessible to unverified accounts.
 * @private
 */
export const NOTES = "/notes";
