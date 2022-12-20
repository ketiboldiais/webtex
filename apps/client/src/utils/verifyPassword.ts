import { statusCode } from "./statusCodes";

export const validatePassword = (password: string) => {
  if (password.length === 0) {
    return statusCode.emptyStringPassword;
  }
  if (password.length < 10) {
    return statusCode.passwordTooShort;
  }
  if (password.length > 60) {
    return statusCode.passwordTooLong;
  }
  return statusCode.ok;
};
