import * as Yup from "yup";

export const verifyLoginSubmission = Yup.object({
  email: Yup.string()
    .required("Email required")
    .min(3, "Invalid email")
    .max(25, "Email too long."),
  password: Yup.string()
    .required()
    .min(10, "Password too short.")
    .max(60, "Password too long."),
});

export const verifyRegisterSubmission = Yup.object({
  email: Yup.string()
    .required("Email required")
    .min(3, "Invalid email")
    .max(25, "Email too long."),
  password: Yup.string()
    .required()
    .min(10, "Password too short.")
    .max(60, "Password too long."),
});

export const verifyNoteSave = Yup.object({
  title: Yup.string()
    .required("Title required.")
    .min(5, "Title must be at least 5 characters")
    .max(50, "Title cannot exceed 50 characters."),
  created: Yup.date().required("Created date required."),
  modified: Yup.date().required("Modified date required"),
  user: Yup.string().required("Save unavailable. User not logged in."),
});
