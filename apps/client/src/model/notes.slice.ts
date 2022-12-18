import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { fetchBase } from "./api.slice";

/**
 * @description API for notes storage
 * 1. Client clicks 'save note'
 * 2. `SaveNote` request is sent: `POST /notes`
 * 3. Server sends note to S3 bucket.
 * 4. Server stores note metadata into the database.
 * 5. When client requests their notes, server:
 *   - Gets client's notes from the database,
 *   - Generate secure, unique URL for photo
 *   - Return (note metadata + URL) to client.
 *   - Client uses that data to get note from S3.
 */

export const notesAPI = createApi({
  baseQuery: fetchBase,
	tagTypes: ['Note'],
	endpoints: (builder) => ({
		 
	})
});
