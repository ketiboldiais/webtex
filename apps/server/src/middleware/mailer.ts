import nodemailer from "nodemailer";
import Env from "../configs/index.js";

export const nodeMailer = nodemailer.createTransport({
  service: "gmail",
  auth: Env.mail,
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
