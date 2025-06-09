import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const [codigoInvalido, setCodigoInvalido] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        { withCredentials: true }
      );
      if (response.data.require_code) {
        setEsperandoCodigo(true);
        setLoading(false); 
        return;
      }
      // Login normal
      localStorage.setItem('usuarioNombre', response.data.nombre);
      localStorage.setItem('usuarioRol', response.data.rol);
      localStorage.setItem('usuarioEmail', response.data.email);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false); 
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCodigoInvalido(false);

    if (!codigo) {
      setCodigoInvalido(true);
      setError('Por favor ingresá el código enviado por mail.');
      return;
    }

    if (!/^\d{5}$/.test(codigo)) {
      setCodigoInvalido(true);
      setError('El código debe tener exactamente 5 dígitos numéricos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/verificar-codigo',
        { email, codigo },
        { withCredentials: true }
      );
      localStorage.setItem('usuarioNombre', response.data.nombre);
      localStorage.setItem('usuarioRol', response.data.rol);
      localStorage.setItem('usuarioEmail', response.data.email);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Código incorrecto');
      setCodigoInvalido(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="login-page-container">
          <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '98%', border: '1px solid red'}}>
            <h2 className="text-center mb-4 text-danger">Iniciar Sesión</h2>
            {!esperandoCodigo ? (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña:</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Link para recuperar contraseña arriba del botón */}
                <div className="text-center mb-3">
                  <Link
                    to="/solicitar-recuperacion"
                    style={{ color: "#0d6efd", textDecoration: "underline", fontWeight: 500 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                  {loading ? "Enviando..." : "Ingresar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerificarCodigo}>
              <div className="mb-3">
                <label htmlFor="codigo" className="form-label">Código de 5 dígitos:</label>
                <input
                  type="text"
                  id="codigo"
                  className={`form-control ${codigoInvalido ? 'is-invalid' : ''}`}
                  value={codigo}
                  onChange={e => {
                    setCodigo(e.target.value.replace(/\D/g, '').slice(0, 5));
                    if (codigoInvalido) setCodigoInvalido(false);
                    setError('');
                  }}
                  maxLength={5}
                />
                {codigoInvalido && (
                  <div className="invalid-feedback text-center">
                    {error}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-danger w-100"
                disabled={loading || codigo.length !== 5}
              >
                {loading ? "Verificando..." : "Verificar Código"}
              </button>
            </form>
            )}
            {error && !codigoInvalido && (
              <div className="alert alert-danger text-center p-2" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;