import React, { useState } from "react";
import { motion } from "framer-motion";

// server

// styles
import Styles from "./styles/Login.module.css";

// const LOGIN_URL = "/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    </motion.div>
  );
};

export default Login;
