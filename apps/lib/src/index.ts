import Joi from "joi";
import { SERVER_FAIL, ServerMessage, User } from "@webtex/shared";

const authSchema = Joi.object({
  email: Joi.string().min(3).required(),
  password: Joi.string().min(10).max(50).required(),
});

export const validateAuthPayload = (
  AuthPayload: User
): ServerMessage | User => {
  const { error, value } = authSchema.validate(AuthPayload);
  if (error) {
    return SERVER_FAIL;
  } else {
    return value;
  }
};
