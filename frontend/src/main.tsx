import React from "react";
import { createHashRouter, Navigate, replace, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";

import "./style.css";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import ErrorBoundary from "./components/ErrorBoundary";
import Catalog from "./pages/Catalog";
import RouteErrorPage from "./pages/RouteErrorPage";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/catalog", element: <Catalog /> },
      { path: "/about", element: <About /> },
      { path: "*", element: <Navigate to="/" replace={true} /> },
    ],
  },
]);

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
