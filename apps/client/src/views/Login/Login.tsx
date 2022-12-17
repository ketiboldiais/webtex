import React, { useState, useEffect } from "react";

// styles
import Styles from "./styles/Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // reset error when user enters input
  useEffect(() => {
    setError("");
  }, [email, password]);

  // form handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
    } catch (error: any) {
      if (!error?.rkesponse) {
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
