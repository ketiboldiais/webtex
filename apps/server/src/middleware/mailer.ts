import nodemailer from "nodemailer";
import { BASE, VERIFY } from "@webtex/shared";
import Env from "../configs/index.js";

export const nodeMailer = nodemailer.createTransport({
  service: "gmail",
  auth: Env.mail,
});

export const buildMail = (userEmail: string, otpToken: string) => {
  return {
    from: "Webtex <webtexstaff@gmail.com>",
    to: userEmail,
    subject: "Webtex Verification",
    html: `<h1>Thanks for registering with Webtex!<h1>
           <p>Click <a href="${BASE}${VERIFY}${otpToken}">here</a> to complete the registeration process.</p>`,
  };
};

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
