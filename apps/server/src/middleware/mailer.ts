import nodemailer from "nodemailer";
import { ROOT_DOMAIN } from "@webtex/types";
import { jwtAccessKey } from "src/configs";
import { nodeMailUser, nodeMailpass } from "src/configs";
import crypto from "crypto";

export const nodeMailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: nodeMailUser,
    pass: nodeMailpass,
  },
});

export const mailOTP = async (userEmail: string, otp: string) => {
  try {
    await nodeMailer.sendMail({
      from: "Webtex <webtexstaff@gmail.com>",
      to: userEmail,
      subject: "Webtex Verification Code",
      html: `<h1>Thanks for registering with Webtex!<h1>
             <p>Paste this verification code to the registration page:</p>
             <div>${otp}</div>
             <p>This code will expire in 1 minute.</p>`,
    });
    return true;
  } catch (error: any) {
    return false;
  }
};

export const sendEmail = async (userEmail: string, emailLink: string) => {
  try {
    await nodeMailer.sendMail({
      from: "Webtex <webtexstaff@gmail.com>",
      to: userEmail,
      subject: "Webtex Verification",
      html: `<h1>Thanks for registering with Webtex!<h1>
             <p>Click <a href="${emailLink}">here</a> to complete the registeration process.</p>`,
    });
    return true;
  } catch (error: any) {
    return false;
  }
};

export const createVerifyEmailToken = async (email: string) => {
  try {
    // Auth String, JWT signature, email
    const authString = `${jwtAccessKey}:${email}`;
    return crypto.createHash("sha256").update(authString).digest("hex");
  } catch (error: any) {}
};

export const createVerifyEmailLink = async (email: string) => {
  try {
    const emailToken = await createVerifyEmailToken(email);
    const URIencodedEmail = encodeURIComponent(email);
    return `${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`;
  } catch (error: any) {}
};
