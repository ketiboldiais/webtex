import * as Yup from "yup";

export const authInputSchema = Yup.object({
  email: Yup.string()
    .required("Email required")
    .min(3, "Invalid email.")
    .max(25, "Email too long."),
  password: Yup.string()
    .required("Password required.")
    .min(10, "Password too short.")
    .max(60, "Password too long."),
}).required();
