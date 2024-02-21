import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAPI from "./useAPI";

export default function ViewUsers() {
  const { token, setToken } = useOutletContext();

  const [users, setUsers] = useState([]);

  const fetchAPI = useAPI(token, setToken);

  useEffect(() => {
    fetchAPI("/user", {})
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
      });
  }, [fetchAPI, setUsers]);

  const deleteUser = (username) => {
    fetchAPI(`/user/${username}`, { method: "DELETE" }).then(() => {
      setUsers((usrs) => usrs.filter((user) => user.username !== username));
    });
  };

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.username} style={{ display: "flex", gap: "0.5rem" }}>
            <span>{user.username}</span>
            <button onClick={() => deleteUser(user.username)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
