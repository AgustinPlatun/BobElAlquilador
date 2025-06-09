import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Servicios from './pages/Servicios';
import Login from './pages/Login';
import Register from './pages/Register';
import MiCuenta from './pages/myAccount';
import AltaMaquinaria from './pages/altas/altaMaquinaria';
import Contacto from './pages/contacto';
import BajaMaquinaria from './pages/bajas/bajaMaquinaria';
import RegistrarEmpleado from './pages/registrarEmpleado';
import UsuariosPendientes from './pages/verificarCuentas';
import RegistrarCliente from './pages/registrarClientePorEmpleado';
import DetalleMaquinaria from './pages/detalleMaquinaria/detalleMaquinaria';
import BajaEmpleado from './pages/bajas/bajaEmpleado';
import PagoExitoso from './pages/pagos/pagoExitoso';
import PagoFallido from './pages/pagos/pagoFallido';
import PagoPendiente from './pages/pagos/pagoPendiente';
import AltaEmpleado from './pages/altas/altaEmpleado';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import RecuperarPassword from './pages/RecuperarPassword';
import NotFound from './pages/NotFound';
import AltaCategoria from './pages/altas/altaCategoria';
import BajaCategoria from './pages/bajas/bajaCategoria';

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
    path: "/detalle-maquinaria/:codigo",
    element: <DetalleMaquinaria />
  },
  {
    path: "/desactivar-cuenta",
    element: <BajaEmpleado />
  },
  {
    path: "/pago-exitoso",
    element: <PagoExitoso />
  },
  {
    path: "/pago-fallido",
    element: <PagoFallido />
  },
  {
    path: "/pago-pendiente",
    element: <PagoPendiente />
  },
  {
    path: "/alta-empleado",
    element: <AltaEmpleado />
  },
  {
    path: "/solicitar-recuperacion",
    element: <SolicitarRecuperacion />
  },
  {
    path: "/recuperar-password/:token",
    element: <RecuperarPassword />
  },
  {
    path: "*",
    element: <NotFound />
  },
  {
    path: "/alta-categoria",
    element: <AltaCategoria />
  },
  {
    path: "/baja-categoria",
    element: <BajaCategoria />
  }
]);

export default router;
