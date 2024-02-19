import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./App.module.css";
import LoginForm from "./LoginForm";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/users">Create a user</Link>
          </li>
          <li>
            <Link to="/view-users">View all users</Link>
          </li>
          <li
            onClick={() => {
              setToken(null);
            }}
          >
            Logout
          </li>
        </ul>
      </nav>
      <main className={styles.content}>
        {token === null ? (
          <LoginForm setToken={setToken} />
        ) : (
          <Outlet
            context={{
              token,
            }}
          />
        )}
      </main>
    </>
  );
}

export default App;
