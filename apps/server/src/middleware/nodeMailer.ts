import nodemailer from "nodemailer";
import { nodeMailUser, nodeMailpass } from "src/configs";

export const nodeMailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: nodeMailUser,
    pass: nodeMailpass,
  },
});
