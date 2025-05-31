import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Logo from './Logo';
import NavLinks from './NavLinks';
import UserDropdown from './UserDropdown';
import GuestButtons from './GuestButtons';
import { MenuOption } from './Types';

const Navbar: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [showResultados, setShowResultados] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setUsuario(localStorage.getItem('usuarioNombre'));
    setRol(localStorage.getItem('usuarioRol'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioRol');
    setUsuario(null);
    setRol(null);
    navigate('/');
  };

  const getMenuOptions = (): MenuOption[] => {
    const options: MenuOption[] = [{ label: 'Mis datos', path: '/mis-datos' }];
    if (rol === 'administrador') {
      options.push({ label: 'Alta de maquinaria', path: '/alta-maquinaria' });
      options.push({ label: 'Baja de maquinaria', path: '/baja-maquinaria' });
      options.push({ label: 'Registrar empleado', path: '/registrar-empleado' });
      options.push({ label: 'Desactivar una cuenta', path: '/desactivar-cuenta' });
    } else if (rol === 'empleado') {
      options.push({ label: 'Verificar cuentas', path: '/verificar-cuentas' });
      options.push({ label: 'Registrar cliente', path: '/registrar-cliente' });
    }
    options.push({ label: 'Cerrar sesión', action: handleLogout });
    return options;
  };

  useEffect(() => {
    const fetchResultados = async () => {
      if (busqueda.trim().length === 0) {
        setResultados([]);
        setShowResultados(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/maquinarias');
        const coincidencias = res.data.filter((m: any) =>
          m.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
        setResultados(coincidencias);
        setShowResultados(true);
      } catch {
        setResultados([]);
        setShowResultados(true);
      }
      setLoading(false);
    };

    const delayDebounce = setTimeout(fetchResultados, 300);
    return () => clearTimeout(delayDebounce);
  }, [busqueda]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger w-100">
      <div className="container-fluid d-flex align-items-center justify-content-between px-0">
        <Logo isLargeScreen={isLargeScreen} />

        {/* Barra de búsqueda */}
        <div className="position-relative me-3" style={{ minWidth: 250 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar maquinaria..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onFocus={() => busqueda && setShowResultados(true)}
            onBlur={() => setTimeout(() => setShowResultados(false), 200)}
            style={{ width: 250 }}
          />
          {showResultados && (
            <div
              className="list-group position-absolute w-100 shadow"
              style={{ zIndex: 1000, maxHeight: 250, overflowY: 'auto' }}
            >
              {loading && (
                <div className="list-group-item text-center">Buscando...</div>
              )}
              {!loading && resultados.length === 0 && (
                <div className="list-group-item text-center text-muted">
                  No se encontraron maquinarias
                </div>
              )}
              {!loading && resultados.map((m) => (
                <a
                  key={m.id}
                  href={`/detalle-maquinaria/${encodeURIComponent(m.nombre)}`}
                  className="list-group-item list-group-item-action"
                >
                  {m.nombre}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: menú hamburguesa y usuario */}
        <div className="d-flex d-lg-none align-items-center gap-2" style={{ marginLeft: '42px' }}>
          <button
            className="navbar-toggler border border"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {usuario ? (
            <UserDropdown usuario={usuario} menuOptions={getMenuOptions()} isMobile />
          ) : (
            <GuestButtons isMobile />
          )}
        </div>

        {/* Menú principal y usuario en desktop */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto justify-content-center w-100">
            <NavLinks />
          </ul>

          <div
            className="d-none d-lg-flex align-items-center justify-content-end me-2"
            style={{ minWidth: isLargeScreen ? '260px' : undefined }}
          >
            {usuario ? (
              <UserDropdown usuario={usuario} menuOptions={getMenuOptions()} />
            ) : (
              <GuestButtons isMobile={false} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
