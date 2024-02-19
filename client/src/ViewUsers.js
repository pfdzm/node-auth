import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function ViewUsers() {
  const { token } = useOutletContext();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
      });
  }, [token]);

  const deleteUser = (username) => {
    fetch(`${process.env.REACT_APP_API_URL}/user/${username}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) {
        return;
      }
      setUsers(users.filter((user) => user.username !== username));
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
