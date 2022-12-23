/**
 * @description Log out of account
 * @route DELETE /auth
 * @access Private
 */

import { MissingDataMessage, message } from "@webtex/types";
import { Request, Response } from "express";
import { devlog } from "src/dev";

export const logout = async (req: Request, res: Response) => {
  try {
    devlog("Getting session cookie.");
    const user = req.session.user;
    devlog(`req.session.user: ${user}`);
    if (user) {
      req.session.destroy((err) => {
        if (err) {
          devlog(`Error destroying session: ${err}`);
          return res.status(204).json({ message: message.success });
        }
        devlog(`Clearing cookie.`);
        res.clearCookie("user");
        devlog(`Cookie cleared.`);
        return res.status(200).json({ message: message.success });
      });
    } else {
      devlog(`Something went wrong. Couldn't find req.session.user.`);
      return res.status(204).json({ message: message.success });
    }

    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(204).json(MissingDataMessage);
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.status(200);
  } catch (error) {
    devlog(`Async error: ${error}.`);
    return res.status(500).json({ message: message.logoutFailed });
  }
};
