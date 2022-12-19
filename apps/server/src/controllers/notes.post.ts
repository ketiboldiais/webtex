import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PostNotesRequest, message } from "@webtex/api";
import { Response } from "express";
import { webtex_s3_client } from "src/database/s3";

export const saveNewNote = (req: PostNotesRequest, res: Response) => {
  const { id, user, created, modified, title } = req.body;
  if (!id || !user || !created || !modified || !title) {
    return res.status(400).json({ data: message.missingData });
  }
	
};
