import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSlice } from "@reduxjs/toolkit";
import { NOTE_STATE } from "../../client";
import { DEFAULT_NOTE } from "../../../src/config";

const initial_note_slice_state: NOTE_STATE = {
  currentNote: DEFAULT_NOTE,
  notes: [],
};

const notesSlice = createSlice({
  name: "notes",
  initialState: initial_note_slice_state,
  reducers: {
    // createNote => save to local storage first
    // deleteNote
  },
});

export default notesSlice.reducer;
