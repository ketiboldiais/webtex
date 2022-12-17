import express from "express";
import { deleteNote, getNotes, saveNote } from "src/controllers/notes.get";

const noteRoutes = express.Router();
noteRoutes.route("/").get(getNotes);
noteRoutes.route("/").post(saveNote);
noteRoutes.route("/").delete(deleteNote);
export default noteRoutes;
