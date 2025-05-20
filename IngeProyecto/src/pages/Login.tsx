import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('usuarioNombre', response.data.nombre);
        localStorage.setItem('usuarioRol', response.data.rol);
        navigate('/');
      }
    } catch (error) {
      setError('Datos incorrectos');
      console.log(error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="login-page-container">
          <div
            className="card p-4 shadow"
            style={{ maxWidth: '400px', width: '90%', border: '1px solid red' }}
          >
            <h2 className="text-center mb-4 text-danger">Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger text-center p-2" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-danger w-100">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
