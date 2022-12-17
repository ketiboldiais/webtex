import { Response } from "express";
import { db } from "src/database/db";
import {
  DeleteNoteRequest,
  GetNotesRequest,
  SaveNewNoteRequest,
} from "src/server";

export const getNotes = async (req: GetNotesRequest, res: Response) => {
  const { user } = req.body;
  const notes = await db
    .selectFrom("notes")
    .selectAll()
    .where("user", "=", user)
    .orderBy("modified")
    .execute();
  if (!notes || notes.length === 0) {
    return res.status(400).json({ message: "No notes found" });
  }
  res.json({ notes });
};

// S3 handles URL
export const saveNote = async (req: SaveNewNoteRequest, res: Response) => {
  const { user, created, modified, title } = req.body;
  if (
    !user ||
    typeof user !== "string" ||
    typeof created !== "string" ||
    typeof modified !== "string"
  ) {
    return res.status(400).json({ message: "All fields required" });
  }
  const savedNote = await db
    .insertInto("notes")
    .values({ user, created, modified, title })
    .executeTakeFirst();
  if (savedNote) {
    return res.status(200).json({ message: "New note saved" });
  } else {
    return res.status(400).json({ message: "Invalid note data received." });
  }
};

export const deleteNote = async (req: DeleteNoteRequest, res: Response) => {
  const { user, id } = req.body;
  if (!user || !id || typeof user !== "string" || typeof id !== "string") {
    return res.status(400).json({ message: "Note ID required" });
  }
  const foundNote = await db
    .selectFrom("notes")
    .select(["id"])
    .where("id", "=", Number(id))
    .executeTakeFirst();
  if (!foundNote) {
    return res.status(400).json({ message: "No such note exists." });
  }
  const deletedNote = await db
    .deleteFrom("notes")
    .where("id", "=", foundNote.id)
    .executeTakeFirst();
  const reply = `Deleted note ${deletedNote}`;
  return res.status(200).json({ message: reply });
};
