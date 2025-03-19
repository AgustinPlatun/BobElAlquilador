import React from 'react';
import './Login.css';
import Navbar from '../../Components/Navbar/Navbar';

const Login: React.FC = () => {
  return (
    <div>
        <Navbar></Navbar>
        <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input type="text" id="username" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input type="password" id="password" className="form-input" />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;