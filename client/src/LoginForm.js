import styles from "./LoginForm.module.css";
import { useState } from "react";
import Spinner from "./Spinner";
// import { useOutletContext } from "react-router-dom";
import useAPI from "./useAPI";

export default function LoginForm({ setToken }) {
  const [loading, setLoading] = useState(false);
  const fetchAPI = useAPI();
  return (
    <>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          setLoading(true);
          fetchAPI("/login", {
            method: "POST",
            body: JSON.stringify(data),
          })
            .then((res) => {
              res.text().then((token) => {
                setToken(token);
                localStorage.setItem("token", token);
              });
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <h1>Login</h1>
        <label htmlFor="username">username</label>
        <input required type="text" name="username" />
        <label htmlFor="password">password</label>
        <input required type="password" name="password" />
        <button type="submit">{loading ? <Spinner /> : "Login"}</button>
      </form>
    </>
  );
}
