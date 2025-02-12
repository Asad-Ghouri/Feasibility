import React from "react";
import { useState, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./layouts/layout";
import Contracts from "./pages/Contracts"
import Estimate from "./pages/Estimate";
import Settings from "./pages/Settings";
import Threshold from "./pages/Threshold"
import Blueprint from "./pages/Blueprint";
import Payment from "./pages/Payment"; // added import statement
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Loader from "./Componenets/Loader";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth check function
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user.id;
};

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Dashboard/>,
      },
      {
        path:"/Blueprint",
        element:<Blueprint/>,
      },
      {
        path:"/Payment",
        element: <Payment/>,
      },
      {
        path:"/Contract",
        element:<Contracts/>
      },
      {
        path:"/Estimate",
        element: <Estimate/>
      },
      {
        path:"/Settings",
        element: <Settings/>
      },
      { 
        path:"/Threshold",
        element: <Threshold/>
      }
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
