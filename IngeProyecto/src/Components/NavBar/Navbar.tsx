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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setUsuario(sessionStorage.getItem('usuarioNombre'));
    setRol(sessionStorage.getItem('usuarioRol'));
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const getMenuOptions = (): MenuOption[] => {
    const options: MenuOption[] = [
      { label: 'Mis datos', path: '/mis-datos' }
    ];
    
    if (rol === 'cliente' || rol === 'empleado') {
      options.push({ label: 'Mis Reservas', path: '/mis-reservas' });
    }
    
    if (rol === 'administrador') {
      options.push({ label: 'Ver Ingresos', path: '/ingresos' });
      options.push({ label: 'Reservas de Hoy', path: '/reservas-hoy' });
      options.push({ label: 'Cambiar rol de cliente a empleado', path: '/alta-empleado' });
      options.push({ label: 'Baja de maquinaria', path: '/baja-maquinaria' });
      options.push({ label: 'Registrar empleado', path: '/registrar-empleado' });
      options.push({ label: 'Cambiar rol de empleado a cliente', path: '/desactivar-cuenta' });
      options.push({ label: 'Alta de Maquinaria', path: '/alta-maquinaria' });
      options.push({ label: 'Alta de Categoria', path: '/alta-categoria' });
      options.push({ label: 'Baja de Categoria', path: '/baja-categoria' });
    } else if (rol === 'empleado') {
      options.push({ label: 'Reservas de Hoy', path: '/reservas-hoy' });
      options.push({ label: 'Verificar cuentas', path: '/verificar-cuentas' });
      options.push({ label: 'Registrar cliente', path: '/registrar-cliente' });
      options.push({ label: 'Preguntas sin responder', path: '/preguntas-sin-responder' });
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
        <div
          className={`position-relative me-3 ${!isLargeScreen ? 'mx-auto mt-4 mb-2' : ''}`}
          style={{
            minWidth: 250,
            width: isLargeScreen ? 250 : '90%',
            maxWidth: 400,
            ...(isLargeScreen ? {} : { display: 'block' }),
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Buscar maquinaria..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onFocus={() => busqueda && setShowResultados(true)}
            onBlur={() => setTimeout(() => setShowResultados(false), 200)}
            style={{ width: '100%' }}
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
              {!loading && resultados.map((m: any) => (
                <button
                  key={m.codigo}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setShowResultados(false);
                    // Redirige usando el código único
                    window.location.href = `/detalle-maquinaria/${encodeURIComponent(m.codigo)}`;
                  }}
                >
                  {m.nombre} <span className="text-muted">({m.codigo})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: botón hamburguesa y usuario arriba a la derecha */}
        <div className="d-lg-none position-absolute top-0 end-0 mt-0 me-2 d-flex align-items-center gap-2" style={{ zIndex: 1050 }}>
          <button
            className="navbar-toggler border"
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
              <UserDropdown usuario="Menú de opciones" menuOptions={getMenuOptions()} />
            ) : (
              <GuestButtons isMobile={false} />
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cerrar sesión</h5>
                <button type="button" className="btn-close" onClick={() => setShowLogoutModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas cerrar sesión?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    sessionStorage.removeItem('usuarioNombre');
                    sessionStorage.removeItem('usuarioRol');
                    setUsuario(null);
                    setRol(null);
                    setShowLogoutModal(false);
                    navigate('/');
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
