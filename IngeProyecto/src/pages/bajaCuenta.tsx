import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';

const BajaCuenta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const rol = localStorage.getItem('usuarioRol');

  if (rol !== 'administrador') {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            Solo el administrador puede dar de baja empleados.
          </div>
        </div>
      </div>
    );
  }

  // Paso 1: Buscar si existe el empleado antes de confirmar
  const buscarEmpleado = async () => {
    setMensaje('');
    setError('');
    setConfirmar(false);
    setNombreEmpleado('');
    if (!email) {
      setError('Por favor, ingrese el email del empleado.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/usuario?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rol !== 'empleado') {
          setError('El usuario encontrado no es un empleado.');
          return;
        }
        setNombreEmpleado(`${data.nombre} ${data.apellido}`);
        setShowModal(true); // Mostrar modal
      } else {
        setError('No existe un empleado con ese email.');
      }
    } catch {
      setError('Error al buscar el empleado.');
    }
  };

  // Paso 2: Confirmar y dar de baja
  const handleBajaEmpleado = async () => {
    setMensaje('');
    setError('');
    try {
      const response = await fetch('http://localhost:5000/baja-empleado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const resData = await response.json();
      if (response.ok) {
        setMensaje(resData.message || 'Empleado dado de baja correctamente.');
        setEmail('');
        setConfirmar(false);
        setNombreEmpleado('');
        setShowModal(false);
      } else {
        setError(resData.message || 'No se pudo dar de baja el empleado.');
      }
    } catch (error) {
      setError('Hubo un problema al dar de baja el empleado.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="baja-cuenta-page d-flex justify-content-center align-items-center" style={{ width: '100vw', height: '100vh' }}>
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid red' }}>
          <h2 className="text-center mb-4">Baja de empleado</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email del empleado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={showModal}
            />
          </div>
          <button className="btn btn-danger w-100 mb-3" onClick={buscarEmpleado} disabled={showModal}>
            Degradar empleado
          </button>
          {mensaje && (
            <div className="alert alert-info text-center p-2 mt-2" role="alert">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="alert alert-danger text-center p-2 mt-2" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar baja</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-warning text-center mb-2">
                  ¿Está seguro de dar de baja al empleado <span className="fw-bold">{nombreEmpleado}</span> ({email})?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={handleBajaEmpleado}>
                  Confirmar
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BajaCuenta;
