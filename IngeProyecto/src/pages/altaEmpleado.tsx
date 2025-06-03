import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';

const AltaEmpleado: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const rol = localStorage.getItem('usuarioRol');

  if (rol !== 'administrador') {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            Solo el administrador puede dar de alta empleados.
          </div>
        </div>
      </div>
    );
  }

  const handleAltaEmpleado = async () => {
    setMensaje('');
    setError('');
    if (!email) {
      setError('Por favor, ingrese el email del usuario.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/alta-empleado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const resData = await response.json();
      if (response.ok) {
        setMensaje(resData.message || 'Usuario promovido a empleado correctamente.');
        setEmail('');
      } else {
        setError(resData.message || 'No se pudo dar de alta el empleado.');
      }
    } catch (error) {
      setError('Hubo un problema al dar de alta el empleado.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="baja-cuenta-page d-flex justify-content-center align-items-center" style={{ width: '100vw', height: '100vh' }}>
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid green' }}>
          <h2 className="text-center mb-4">Alta de empleado</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email del usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-success w-100 mb-3" onClick={handleAltaEmpleado}>
            Promover empleado
          </button>
          {mensaje && (
            <div className="alert alert-info text-center p-2" role="alert">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="alert alert-danger text-center p-2" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AltaEmpleado;