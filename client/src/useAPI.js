import { useCallback } from "react";

export default function useAPI(token, setToken) {
  return useCallback(
    async (path, options) => {
      return fetch(`${process.env.REACT_APP_API_URL}${path}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            setToken(null);
            localStorage.removeItem("token");
          }
          return Promise.reject(res);
        }
        return res;
      });
    },
    [token, setToken]
  );
}
