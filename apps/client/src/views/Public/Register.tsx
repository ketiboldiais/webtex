import React, { useEffect, useState, useRef } from "react";
import { validatePassword } from "../../utils/verifyPassword";
import { statusCode } from "../../utils/statusCodes";
import { useRegisterMutation } from "../../model/auth.api";
import { validateAuthPayload } from "@webtex/lib";

// styles
import Styles from "../../styles/Register.module.css";

const Register = () => {
  const promptRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [password2, setPassword2] = useState("");
  const [password2Focus, setPassword2Focus] = useState(false);
  const [password2Match, setPassword2Match] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [register] = useRegisterMutation();
  const promptClass = instruction ? Styles.Prompt : Styles.Offscreen;

  useEffect(() => {
    const result = validatePassword(password);
    if (emailFocus && email) {
      setInstruction(
        "Enter a valid email no longer than 90 characters. A secret code will be sent to your email to complete registration."
      );
    } else {
      setInstruction("");
    }
    if (passwordFocus && result === statusCode.passwordTooShort) {
      setInstruction("Password must be at least 10 characters.");
    }
    if (passwordFocus && result === statusCode.passwordTooLong) {
      setInstruction("Password must be less than 60 characters.");
    }
    setValidPassword(result === statusCode.ok);
    const match = password2 === password;
    if (password2Focus && !match) {
      setInstruction("Passwords must match");
    }
    setPassword2Match(match);
  }, [password, password2, email, password2Focus, passwordFocus, emailFocus]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validatePassword(password);
    const match = password === password2;
    if (result !== statusCode.ok || !match) {
      setInstruction("Invalid form fields.");
      return;
    }
    const payload = validateAuthPayload({ email, password });
    if (payload === null) {
      setInstruction("Form fields could not be validated.");
      return;
    }
    try {
      await register(payload).unwrap();
      return setInstruction(`Verification link sent to ${email}.`);
    } catch (error: any) {
      setInstruction(`Server unavailable at the moment.`);
    }
  };

  return (
    <article>
      <section className={Styles.RegisterContainer}>
        <h1 className={Styles.RegisterHeader}>Register</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <input
              required
              type="email"
              autoComplete="off"
              placeholder="Email"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onChange={(event) => {
                if (event.isTrusted) {
                  setEmail(event.target.value);
                }
              }}
            />
          </label>
          <label>
            <input
              required
              type="text"
              autoComplete="off"
              placeholder="Password"
              aria-invalid={validPassword ? "false" : "true"}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onChange={(event) => {
                if (event.isTrusted) {
                  setPassword(event.target.value);
                }
              }}
            />
          </label>
          <label>
            <input
              required
              type="text"
              autoComplete="off"
              placeholder="Confirm Password"
              aria-invalid={password2Match ? "false" : "true"}
              onFocus={() => setPassword2Focus(true)}
              onBlur={() => setPassword2Focus(false)}
              onChange={(event) => {
                if (event.isTrusted) {
                  setPassword2(event.target.value);
                }
              }}
            />
          </label>
          <button disabled={!email || !validPassword || !password2Match}>
            Register
          </button>
        </form>
      </section>
      <div ref={promptRef} className={promptClass} aria-live="assertive">
        <p>{instruction}</p>
      </div>
    </article>
  );
};

export default Register;
