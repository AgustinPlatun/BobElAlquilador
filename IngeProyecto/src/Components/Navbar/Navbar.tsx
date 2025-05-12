import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    const rolGuardado = localStorage.getItem('usuarioRol');
    console.log('Rol guardado en localStorage:', rolGuardado);
    if (nombreGuardado) {
      setUsuario(nombreGuardado);
    }
    if (rolGuardado) {
      setRol(rolGuardado);
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src="/images/Completo.png"
          alt="Logo"
          style={{ height: '50px' }}
        />
      </div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/servicios">Servicios</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
      <div className="navbar-actions">
        {usuario ? (
          <div className="user-dropdown">
            <span onClick={toggleDropdown} className="user-icon"></span>
            <span onClick={toggleDropdown} className="user-name">
              {usuario && usuario.toUpperCase()} <span className="dropdown-arrow">▼</span>
            </span>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {getMenuOptions().map((option, index) =>
                  option.path ? (
                    <Link key={index} to={option.path} className="dropdown-item">
                      {option.label}
                    </Link>
                  ) : (
                    <span
                      key={index}
                      onClick={option.action}
                      className="dropdown-item"
                      style={{ cursor: 'pointer' }}
                    >
                      {option.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button onClick={() => navigate('/register')}>Registrarse</button>
          </>
        )}
      </div>
      <div className="navbar-toggle" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </nav>
  );
};

export default Navbar;