import { Navigate, createMemoryRouter } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { Login } from "./Login";
import { Main } from "./Main";

export const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <Layout></Layout>,
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "main",
          element: <Main />,
        },
        {
          path: "*",
          element: <Navigate to="/login" />,
        },
      ],
    },
  ],
  {
    initialEntries: ["/login"],
  },
);
