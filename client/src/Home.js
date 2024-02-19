import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function Home() {
  const { token, setToken } = useOutletContext();

  const [user, setUser] = useState([]);

  useEffect(() => {
    if (token === null) {
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/whoami`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) {
        if (!res.ok) {
          setToken(null);
          localStorage.removeItem("token");
        }
        return;
      }
      res.json().then((user) => {
        setUser(user);
      });
    });
  }, [setUser, token, setToken]);

  return (
    <>
      <h1>Welcome</h1>
      <div>Hello {user.username}, nice to see you again!</div>
    </>
  );
}
