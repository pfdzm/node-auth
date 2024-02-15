import styles from "./App.module.css";
import { useState } from "react";
import Spinner from "./Spinner";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  return (
    <main class={styles.app}>
      <form
        class={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          setLoading(true);
          fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((res) => {
              if (!res.ok) {
                // error logging code e.g. Sentry
                console.error("could not log in");
                setToken(null);
                localStorage.removeItem("token");
                return;
              }
              res.text().then((token) => {
                console.log(token);
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

      <button
        onClick={() => {
          if (token === null) {
            console.warn("not authorized");
            return;
          }
          setLoading(true);
          fetch(`${process.env.REACT_APP_API_URL}/all-users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => {
              if (!res.ok) {
                console.error("could not get users");
                return;
              }
              res.json().then((data) => {
                console.log(data);
              });
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        {loading ? <Spinner /> : "Get Users (requires auth)"}
      </button>
    </main>
  );
}

export default App;
