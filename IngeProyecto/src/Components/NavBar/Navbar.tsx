import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    }
    options.push({ label: 'Cerrar sesión', action: handleLogout });
    return options;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger fixed-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <Logo isLargeScreen={isLargeScreen} />

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
            className="d-none d-lg-flex align-items-center justify-content-end"
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
