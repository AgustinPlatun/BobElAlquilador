// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Usa el hook useNavigate

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLoginClickRegister = () => {
    navigate('/register');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">MiLogo</div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/servicios">Servicios</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
      <div className="navbar-actions">
        <button onClick={handleLoginClick}>Iniciar sesión</button>
        <button onClick={handleLoginClickRegister}>Registrarse</button>
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