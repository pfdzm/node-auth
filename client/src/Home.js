import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAPI from "./useAPI";

export default function Home() {
  const { token, setToken } = useOutletContext();
  const fetchAPI = useAPI(token, setToken);

  const [user, setUser] = useState([]);

  useEffect(() => {
    fetchAPI("/whoami").then((res) => {
      res.json().then((user) => {
        setUser(user);
      });
    });
  }, [fetchAPI]);

  return (
    <>
      <h1>Welcome</h1>
      <div>Hello {user.username}, nice to see you again!</div>
    </>
  );
}
