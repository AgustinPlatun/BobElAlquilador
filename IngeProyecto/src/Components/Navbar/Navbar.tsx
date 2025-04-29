import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    if (nombreGuardado) {
      setUsuario(nombreGuardado);
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLoginClickRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioNombre');
    setUsuario(null);
    navigate('/');
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
          <>
            <span style={{ marginRight: '1rem' }}>{usuario}</span>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <button onClick={handleLoginClick}>Iniciar sesión</button>
            <button onClick={handleLoginClickRegister}>Registrarse</button>
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
