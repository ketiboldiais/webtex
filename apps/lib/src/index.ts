import Joi from "joi";
import { OTP, User } from "@webtex/shared";

const authSchema = Joi.object({
  email: Joi.string().min(3).max(90).required(),
  password: Joi.string().min(10).max(50).required(),
});

const otpSchema = Joi.object({
  email: Joi.string().max(7).required(),
  otp: Joi.string().max(7).required(),
});

export const validateAuthPayload = (AuthPayload: User): null | User => {
  const { error, value } = authSchema.validate(AuthPayload);
  if (error) {
    return null;
  } else {
    return value;
  }
};

export const validateOtpPayload = (OtpPayload: OTP): null | OTP => {
  const { error, value } = otpSchema.validate(OtpPayload);
  if (error) {
    return null;
  } else {
    return value;
  }
};
