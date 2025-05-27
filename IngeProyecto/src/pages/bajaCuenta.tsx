import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';

const BajaCuenta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleDesactivar = async () => {
    if (!email) {
      alert('Por favor, ingrese el email la cuenta.');
      return;
    }

    const confirmacion = window.confirm(`¿Está seguro de desactivar la cuenta con email "${email}"?`);
    if (!confirmacion) return;

    try {
      const response = await fetch('http://localhost:5000/baja-cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMensaje('Cuenta desactivada correctamente.');
        setEmail('');
      } else {
        const resData = await response.json();
        setMensaje(resData.message || 'No se pudo desactivar la cuenta.');
      }
    } catch (error) {
      console.error('Error al desactivar cuenta:', error);
      setMensaje('Hubo un problema al desactivar la cuenta.');
    }
  };

  return (
    <div>
      <Navbar />
      <div
        className="baja-cuenta-page d-flex justify-content-center align-items-center"
        style={{ width: '100vw', height: '100vh' }}
      >
        <div
          className="card p-4 shadow"
          style={{ maxWidth: '500px', width: '90%', border: '1px solid red' }}
        >
          <h2 className="text-center mb-4">Baja de cuenta</h2>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email del usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn btn-danger w-100 mb-3" onClick={handleDesactivar}>
            Desactivar cuenta
          </button>

          {mensaje && (
            <div className="alert alert-info text-center p-2" role="alert">
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BajaCuenta;
