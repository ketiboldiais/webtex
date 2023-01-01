import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../model/store";
import { setCredentials, setSession } from "../../model/auth.slice";
import { useSigninMutation } from "../../model/auth.api";

// styles
import Styles from "../../styles/Login.module.css";

const Login = () => {
  // sets focus on user input
  const emailRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [login] = useSigninMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // If errorMessage is not an empty string, the error CSS class is toggled.
  const errClass = errorMessage ? Styles.ErrorMessage : Styles.Offscreen;

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // form handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { accessToken, timestamp } = await login({
        email,
        password,
      }).unwrap();
      dispatch(setCredentials({ accessToken, timestamp }));
      dispatch(setSession());
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error: any) {
      if (!error.status) {
        setErrorMessage("Server currently unavailable.");
      } else if (error.status === 400) {
        setErrorMessage("Missing username or password.");
      } else {
        setErrorMessage("Cannot login at the moment.");
      }
      errorRef.current?.focus();
    }
  };

  const content = (
    <article>
      <section className={Styles.LoginContainer}>
        <h1 className={Styles.LoginHeader}>Login</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <input
              required
              ref={emailRef}
              autoComplete="off"
              type="email"
              placeholder="Email"
              onChange={(event) => {
                if (event.isTrusted) setEmail(event.target.value);
              }}
            />
          </label>
          <label>
            <input
              required
              autoComplete="off"
              type="text"
              placeholder="Password"
              onChange={(event) => {
                if (event.isTrusted) setPassword(event.target.value);
              }}
            />
          </label>
          <button disabled={!email || !password ? true : false}>Login</button>
        </form>
      </section>
      <section>
        <p className={errClass}>{errorMessage}</p>
      </section>
    </article>
  );

  return content;
};

export default Login;
