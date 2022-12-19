import { DeleteUserRequest, message } from "@webtex/api";
import { Response } from "express";
import { db } from "src/database/db";
import bcrypt from "bcrypt";

/**
 * @summary Deletes a user account.
 * @route DELETE `/user`
 * @access private
 * @description
 * This function will process delete account requests.
 * - Expects: An _Express_ request with:
 *   ~~~
 *   body: {
 *     user: string,
 *     email: string,
 *     password: string,
 *   }
 *   ~~~
 */
export const deleteUser = async (req: DeleteUserRequest, res: Response) => {
  const { user, email, password } = req.body;
  if (!user || !email || !password) {
    return res.status(400).json({ data: message.missingData });
  }
  if (
    typeof user !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ data: message.badCredentials });
  }
  try {
    // find user with user string
    const foundUser = await db
      .selectFrom("users")
      .select(["email", "password"])
      .where("user", "=", user)
      .executeTakeFirst();
    if (!foundUser) {
      return res.status(400).json({ data: message.badCredentials });
    }
    // verify email
    if (foundUser.email !== email) {
      return res.status(400).json({ data: message.badCredentials });
    }
    // verify password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(400).json({ data: message.badCredentials });
    }

    // delete account
    const deletedUser = await db
      .deleteFrom("users")
      .where("user", "=", user)
      .executeTakeFirst();

    // handle case where deletion is unsuccessful
    if (!deletedUser) {
      return res.sendStatus(500);
    }

    // TODO: Delete notes

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
