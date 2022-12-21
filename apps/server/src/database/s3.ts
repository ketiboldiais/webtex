import dotenv from "dotenv";
dotenv.config();

import { S3Client } from "@aws-sdk/client-s3";

export const webtex_s3_client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});
