import Joi from "joi";
import { User, message } from "@webtex/types";

const authSchema = Joi.object({
  email: Joi.string().min(3).required(),
  password: Joi.string().min(10).max(50).required(),
});

export const validateAuthPayload = (AuthPayload: User) => {
  const { error, value } = authSchema.validate(AuthPayload);
  if (error) {
    return message.failure;
  } else {
    return value;
  }
};
