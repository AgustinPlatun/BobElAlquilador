import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Servicios from './pages/Servicios';
import Login from './pages/Login';
import Register from './pages/Register';
import MiCuenta from './pages/myAccount';
import AltaMaquinaria from './pages/altaMaquinaria';
import Contacto from './pages/contacto';
import BajaMaquinaria from './pages/bajaMaquinaria';
import RegistrarEmpleado from './pages/registrarEmpleado';
import UsuariosPendientes from './pages/verificarCuentas';
import RegistrarCliente from './pages/registrarClientePorEmpleado';
import DetalleMaquinaria from './pages/detalleMaquinaria';
import BajaCuenta from './pages/bajaCuenta';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/servicios",
    element: <Servicios />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/mis-datos",
    element: <MiCuenta />
  },
  {
    path: "/alta-maquinaria",
    element: <AltaMaquinaria />
  },
  {
    path: "/contacto",
    element: <Contacto />
  },
  {
    path: "/baja-maquinaria",
    element: <BajaMaquinaria />
  }
  ,
  {
    path: "/registrar-empleado",
    element: <RegistrarEmpleado />
  },
  {
    path: "/verificar-cuentas",
    element: <UsuariosPendientes />
  },
  {
    path: "/registrar-cliente",
    element: <RegistrarCliente />
  },
  {
    path: "/detalle-maquinaria/:nombre",
    element: <DetalleMaquinaria />
  },
  {
    path: "/desactivar-cuenta",
    element: <BajaCuenta />
  }
]);

export default router;
