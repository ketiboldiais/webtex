import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../model/state/auth.slice";
import { useLoginMutation } from "../../model/state/authAPI.slice";

// styles
import Styles from "./styles/Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  // reset error when user enters input
  useEffect(() => {
    setError("");
  }, [email, password]);

  // form handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const userData = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...userData, email }));
      setPassword("");
      setEmail("");
    } catch (error: any) {
      if (!error?.response) {
        setError("Our servers are currently down. Try again later.");
      } else if (error?.response?.status === 400) {
        setError("Missing username or password");
      } else {
        setError("Login failed.");
      }
    }
  };

  return (
    <section className={Styles.LoginContainer}>
      <h1 className={Styles.LoginHeader}>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            required
            type="email"
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
            placeholder="Password"
            onChange={(event) => {
              if (event.isTrusted) setPassword(event.target.value);
            }}
          />
        </label>
        <button>Login</button>
      </form>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </section>
  );
};

export default Login;
