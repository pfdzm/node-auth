import styles from "./LoginForm.module.css";
import { useOutletContext } from "react-router-dom";

export default function CreateUser() {
  const { token, setToken } = useOutletContext();
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        fetch(`${process.env.REACT_APP_API_URL}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) {
            setToken(null);
            localStorage.removeItem("token");
          }
        });
      }}
    >
      <h1>Create a user</h1>
      <label htmlFor="username">username</label>
      <input required type="text" name="username" />
      <label htmlFor="password">password</label>
      <input type="password" name="password" required />
      <button type="submit">Create user</button>
    </form>
  );
}
