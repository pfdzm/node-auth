import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import CreateUser from "./CreateUser";
import ViewUsers from "./ViewUsers";
import Home from "./Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <h1>This page does not exist :( </h1>,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "users",
        element: <CreateUser />,
      },
      {
        path: "view-users",
        element: <ViewUsers />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
