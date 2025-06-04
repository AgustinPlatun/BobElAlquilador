import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Agrega este estado
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
        // Guardar datos en localStorage
        localStorage.setItem('usuarioNombre', response.data.nombre);
        localStorage.setItem('usuarioRol', response.data.rol);
        localStorage.setItem('usuarioEmail', email); // <-- ahora guarda también el email

        // Redirigir al home o página deseada
        navigate('/');
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 403) {
          setError(message || 'Tu cuenta aún no ha sido activada.');
        } else if (status === 401) {
          setError(message || 'Datos incorrectos');
        } else {
          setError('Error al iniciar sesión');
        }
      } else {
        setError('No se pudo conectar al servidor');
      }

      console.log(error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="login-page-container">
          <div
            className="card p-4 shadow"
            style={{ maxWidth: '500px', width: '98%', border: '1px solid red'}}
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
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
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
            <div className="text-center mt-3">
              <a href="/solicitar-recuperacion" className="text-danger" style={{ cursor: 'pointer' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
