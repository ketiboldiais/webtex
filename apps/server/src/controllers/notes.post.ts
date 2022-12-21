import { MissingDataMessage } from "@webtex/types";
import { Request, Response } from "express";

export const saveNewNote = (req: Request, res: Response) => {
  const { id, user, created, modified, title } = req.body;
  if (!id || !user || !created || !modified || !title) {
    return res.status(400).json(MissingDataMessage);
  }
};
