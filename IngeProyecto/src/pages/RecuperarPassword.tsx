import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

const RecuperarPassword: React.FC = () => {
  const { token } = useParams();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: number;
    
    if (mensaje && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            setTimeout(() => navigate('/login'), 100);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [mensaje, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setCountdown(0);
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/recuperar-password/${token}`, {
        nueva_password: nuevaPassword,
      });
      setMensaje('¡Contraseña cambiada correctamente!');
      setCountdown(10);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un problema al cambiar la contraseña.');
    }
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-centered">
        <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
          <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '90%', border: '1px solid red' }}>
            <h2 className="text-center mb-4 text-danger">Nueva Contraseña</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nueva contraseña:</label>
                <div className="input-group">
                  <input
                    type={mostrar ? "text" : "password"}
                    className="form-control"
                    value={nuevaPassword}
                    onChange={e => setNuevaPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setMostrar(m => !m)}
                    tabIndex={-1}
                    aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrar ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Repetir contraseña:</label>
                <div className="input-group">
                  <input
                    type={mostrarConfirmar ? "text" : "password"}
                    className="form-control"
                    value={confirmarPassword}
                    onChange={e => setConfirmarPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setMostrarConfirmar(m => !m)}
                    tabIndex={-1}
                    aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrarConfirmar ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-danger w-100">Cambiar contraseña</button>
            </form>
            {mensaje && (
              <div className="alert alert-success mt-3">
                {mensaje}
                {countdown > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Se redirigirá al inicio de sesión en 10 segundos.
                    </small>
                  </div>
                )}
              </div>
            )}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecuperarPassword;