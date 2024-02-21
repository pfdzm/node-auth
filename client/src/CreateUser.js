import styles from "./LoginForm.module.css";
import { useOutletContext } from "react-router-dom";
import useAPI from "./useAPI";

export default function CreateUser() {
  const { token, setToken } = useOutletContext();
  const fetchAPI = useAPI(token, setToken);
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        fetchAPI("/user", {
          method: "POST",
          body: JSON.stringify(data),
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
