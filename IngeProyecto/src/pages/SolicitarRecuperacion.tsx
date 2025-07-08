import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';

const SolicitarRecuperacion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Efecto para manejar el countdown y redirección
  useEffect(() => {
    let interval: number;
    
    if (mensaje && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            // Cuando llega a 1, en el próximo tick será 0 y se redirige
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
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/solicitar-recuperacion', { email });
      // Mostrar SIEMPRE el mensaje del backend
      setMensaje(res.data.message);
      // Iniciar countdown de 10 segundos
      setCountdown(10);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Hubo un problema al solicitar la recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '90%', border: '1px solid red' }}>
          <h2 className="text-center mb-4 text-danger">Recuperar Contraseña</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input type="email" id="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-danger w-100" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {mensaje && (
            <div className="alert alert-info mt-3">
              {mensaje}
              {countdown > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    Redirigiendo a iniciar sesión en {countdown} segundo{countdown !== 1 ? 's' : ''}...
                  </small>
                </div>
              )}
            </div>
          )}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default SolicitarRecuperacion;