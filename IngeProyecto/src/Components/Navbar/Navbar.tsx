import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">MiLogo</div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/Servicios">Servicios</Link>
        <Link to="/">Contacto</Link>
      </div>
      <div className="navbar-actions">
        <button>Iniciar sesión</button>
        <button>Registrarse</button>
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