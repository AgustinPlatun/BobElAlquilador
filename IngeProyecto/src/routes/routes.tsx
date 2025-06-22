import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Servicios from '../pages/Servicios';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MiCuenta from '../pages/myAccount';
import AltaMaquinaria from '../pages/altas/altaMaquinaria';
import Contacto from '../pages/contacto';
import BajaMaquinaria from '../pages/bajas/bajaMaquinaria';
import RegistrarEmpleado from '../pages/registrarEmpleado';
import UsuariosPendientes from '../pages/verificarCuentas';
import RegistrarCliente from '../pages/registrarClientePorEmpleado';
import DetalleMaquinaria from '../pages/detalleMaquinaria/detalleMaquinaria';
import BajaEmpleado from '../pages/bajas/bajaEmpleado';
import PagoExitoso from '../pages/pagos/pagoExitoso';
import PagoFallido from '../pages/pagos/pagoFallido';
import PagoPendiente from '../pages/pagos/pagoPendiente';
import AltaEmpleado from '../pages/altas/altaEmpleado';
import SolicitarRecuperacion from '../pages/SolicitarRecuperacion';
import RecuperarPassword from '../pages/RecuperarPassword';
import NotFound from '../pages/NotFound';
import AltaCategoria from '../pages/altas/altaCategoria';
import BajaCategoria from '../pages/bajas/bajaCategoria';
import MisReservas from '../pages/misReservas';
import Ingresos from '../pages/ingresos';
import RequireAdmin from './requireAdmin';
import RequireEmpleado from './requireEmpleado';

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
    path: "/mis-reservas",
    element: <MisReservas />
  },
  {
    path: "/ingresos",
    element:
      <RequireAdmin>
        <Ingresos />
      </RequireAdmin>
  },
  {
    path: "/alta-maquinaria",
    element: (
      <RequireAdmin>
        <AltaMaquinaria />
      </RequireAdmin>
    )
  },
  {
    path: "/contacto",
    element: <Contacto />
  },
  {
    path: "/baja-maquinaria",
    element: (
      <RequireAdmin>
        <BajaMaquinaria />
      </RequireAdmin>
    )
  }
  ,
  {
    path: "/registrar-empleado",
    element: 
      <RequireAdmin>
        <RegistrarEmpleado />
      </RequireAdmin>
  },
  {
    path: "/verificar-cuentas",
    element: 
      <RequireEmpleado>
        <UsuariosPendientes />
      </RequireEmpleado>
  },
  {
    path: "/registrar-cliente",
    element: 
      <RequireEmpleado>
        <RegistrarCliente />
      </RequireEmpleado>
  },
  {
    path: "/detalle-maquinaria/:codigo",
    element: <DetalleMaquinaria />
  },
  {
    path: "/desactivar-cuenta",
    element:
      <RequireAdmin> 
        <BajaEmpleado />
      </RequireAdmin>
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
    element: (
      <RequireAdmin>
        <AltaEmpleado />
      </RequireAdmin>
    )
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
    element: (
      <RequireAdmin>
        <AltaCategoria />
      </RequireAdmin>
    )
  },
  {
    path: "/baja-categoria",
    element: (
      <RequireAdmin>
        <BajaCategoria />
      </RequireAdmin>
    )
  }
]);

export default router;
