import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Servicios from './pages/Services/Servicios';
import Login from './pages/Login/Login.tsx';
import Register from './pages/Register/Register.tsx';
import MiCuenta from './pages/myAccount/myAccount.tsx';
import AltaMaquinaria from './pages/altaMaquinaria/altaMaquinaria.tsx';
import Contacto from './pages/contacto/contacto.tsx';
import BajaMaquinaria from './pages/bajaMaquinaria/bajaMaquinaria.tsx';


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
  },
  {
    path:"/mis-datos",
    element:<MiCuenta></MiCuenta>
  },
  {
    path:"/alta-maquinaria",
    element:<AltaMaquinaria></AltaMaquinaria>
  },
  {
    path:"/contacto",
    element:<Contacto></Contacto>
  },
  {
    path:"/baja-maquinaria",
    element:<BajaMaquinaria></BajaMaquinaria>
  }

])

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById('root')
);