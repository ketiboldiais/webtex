import React, { useEffect, useState } from "react";
// import axios from "../../api/api";
import { motion } from "framer-motion";

// server

// styles
import Styles from "./styles/Register.module.css";

const REGISTER_URL = "/user";

const Register = () => {
  function isValidPassword(pw: string) {
    return pw.length !== 0 && pw.length >= 10 && pw.length < 60;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [password2, setPassword2] = useState("");
  const [password2Focus, setPassword2Focus] = useState(false);
  const [password2Match, setPassword2Match] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const result = isValidPassword(password);
    setValidPassword(result);
    const match = password2 === password;
    setPassword2Match(match);
  }, [password, password2]);

  useEffect(() => {
    setPasswordFocus(false);
    setPassword2Focus(false);
  }, [password, password2, password2Match]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
    >
      <section className={Styles.RegisterContainer}>
        <h1 className={Styles.RegisterHeader}>Register</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <input
              required
              type="email"
              autoComplete="off"
              placeholder="Email"
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
            {passwordFocus && (
              <p className={Styles.errorMessage}>
                Password must be between 10 and 60 characters.
              </p>
            )}
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
            {password2Focus && (
              <p className={Styles.errorMessage}>Password must match.</p>
            )}
          </label>
          <button disabled={!email || !validPassword || !password2Match}>
            Register
          </button>
        </form>
        {error && <p>{error}</p>}
        {success && <p>A verification link was sent to {email}.</p>}
      </section>
    </motion.div>
  );
};

export default Register;
