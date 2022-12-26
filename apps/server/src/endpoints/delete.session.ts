import { Request, Response } from "express";

// SECTION Server Logout
/**
 * @file Logs out the user
 */

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.sendStatus(204);
    }
    req.session.destroy((err) => {
      if (err) return res.status(500);
    });
    res.clearCookie("user");
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500);
  }
};
