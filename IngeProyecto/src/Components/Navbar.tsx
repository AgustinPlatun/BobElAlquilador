import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    const rolGuardado = localStorage.getItem('usuarioRol');
    if (nombreGuardado) setUsuario(nombreGuardado);
    if (rolGuardado) setRol(rolGuardado);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioRol');
    setUsuario(null);
    setRol(null);
    navigate('/');
  };

  const getMenuOptions = () => {
    const options: { label: string; path?: string; action?: () => void }[] = [
      { label: 'Mis datos', path: '/mis-datos' },
    ];

    if (rol === 'administrador') {
      options.push({ label: 'Alta de maquinaria', path: '/alta-maquinaria' });
      options.push({ label: 'Baja de maquinaria', path: '/baja-maquinaria' });
    }

    options.push({ label: 'Cerrar sesión', action: handleLogout });

    return options;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger fixed-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* Logo */}
        <div
          className="d-flex align-items-center"
          style={{
            flex: '0 0 auto',
            minWidth: isLargeScreen ? '260px' : undefined
          }}
        >
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src="/images/Completo.png" alt="Logo" style={{ height: '50px' }} />
          </Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler me-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-label="Toggle navigation"
          style={{ marginLeft: '42px' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Usuario en mobile */}
        <div className="d-flex d-lg-none align-items-center">
          {usuario ? (
            <div className="dropdown">
              <button
                className="btn btn-outline-light rounded-circle dropdown-toggle"
                type="button"
                id="mobileUserDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: '50px', height: '50px', padding: 0, fontSize: '1.2rem' }}
              >
                👤
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="mobileUserDropdown">
                {getMenuOptions().map((option, index) =>
                  option.path ? (
                    <li key={index}>
                      <Link className="dropdown-item" to={option.path}>
                        {option.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={index}>
                      <button className="dropdown-item" onClick={option.action}>
                        {option.label}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
              <button className="btn btn-light text-danger btn-sm" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </div>
          )}
        </div>

        {/* Menú principal y usuario en desktop */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link text-dark mx-1 rounded" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark mx-1 rounded" to="/servicios">Servicios</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark mx-1 rounded" to="/contacto">Contacto</Link>
            </li>
          </ul>

          <div
            className="d-none d-lg-flex align-items-center justify-content-end"
            style={{
              minWidth: isLargeScreen ? '260px' : undefined
            }}
          >
            {usuario ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle fw-bold text-uppercase"
                  type="button"
                  id="desktopUserDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {usuario}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="desktopUserDropdown">
                  {getMenuOptions().map((option, index) =>
                    option.path ? (
                      <li key={index}>
                        <Link className="dropdown-item" to={option.path}>
                          {option.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={index}>
                        <button className="dropdown-item" onClick={option.action}>
                          {option.label}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-light me-2" onClick={() => navigate('/login')}>
                  Iniciar sesión
                </button>
                <button className="btn btn-light text-danger" onClick={() => navigate('/register')}>
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
