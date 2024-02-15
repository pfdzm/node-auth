import styles from "./App.module.css";
import { useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <main class={styles.app}>
      <form
        class={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then((res) => {
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
          });
        }}
      >
        <h1>Login</h1>
        <label htmlFor="username">username</label>
        <input required type="text" name="username" />
        <label htmlFor="password">password</label>
        <input required type="password" name="password" />
        <input type="submit" value="Submit" />
      </form>

      <button
        onClick={() => {
          if (token === null) {
            console.warn("not authorized");
            return;
          }
          fetch(`${process.env.REACT_APP_API_URL}/all-users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => {
            if (!res.ok) {
              console.error("could not get users");
              return;
            }
            res.json().then((data) => {
              console.log(data);
            });
          });
        }}
      >
        Click me if you're authorized
      </button>
    </main>
  );
}

export default App;
