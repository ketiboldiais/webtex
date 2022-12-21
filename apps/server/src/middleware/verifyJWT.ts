import { Request, Response } from "express";
/**
 * @description Middleware for validating JWT.
 * First, all requests for protected routes
 * must be accompanied by a JWT.
 *
 * So, there are two possibilities:
 * 1. User has a JWT
 *   - JWT is invalid
 *     a. Either JWT is expired, OR
 *     b. Attacker is reusing JWT
 *   - JWT is valid
 *     * User is valid user.
 * 2. User does not have a JWT
 *   - Must reauthenticate.
 */

export const validateJWT = async (req: Request, res: Response) => {
  
};
