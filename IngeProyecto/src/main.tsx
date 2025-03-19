import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Servicios from './pages/Services/Servicios';
import Login from './pages/Login/Login.tsx';
import Register from './pages/Register/Register.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>
  },
  {
    path: "/servicios",
    element: <Servicios></Servicios>
  },
  {
    path:"/login",
    element:<Login></Login>
  },
  {
    path:"/register",
    element:<Register></Register>
  }
])

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById('root')
);