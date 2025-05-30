import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';

const BajaMaquinaria: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const rol = localStorage.getItem('usuarioRol');

  // Solo permitir acceso a administradores
  if (rol !== 'administrador') {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            Solo el administrador puede dar de baja maquinarias.
          </div>
        </div>
      </div>
    );
  }

  // Buscar maquinaria por código
  const buscarMaquinaria = async () => {
    setError('');
    setNombre('');
    if (!codigo) return;
    try {
      const res = await fetch('http://localhost:5000/maquinarias');
      const data = await res.json();
      const maquinaria = data.find((m: any) => m.codigo === codigo);
      if (maquinaria) setNombre(maquinaria.nombre);
      else setError('No se encontró maquinaria con ese código.');
    } catch {
      setError('Error al buscar maquinaria.');
    }
  };

  // Dar de baja
  const handleBaja = async () => {
    if (!codigo) {
      setError('Ingrese el código de la maquinaria.');
      return;
    }
    if (!window.confirm(`¿Está seguro de dar de baja la maquinaria "${nombre}"?`)) return;
    try {
      const response = await fetch('http://localhost:5000/baja-maquinaria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      if (response.ok) {
        setMensaje('Maquinaria dada de baja correctamente.');
        setCodigo('');
        setNombre('');
      } else {
        const data = await response.json();
        setError(data.message || 'No se pudo dar de baja la maquinaria.');
      }
    } catch {
      setError('Hubo un problema al dar de baja la maquinaria.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="baja-maquinaria-page d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid red' }}>
          <h2 className="text-center mb-4">Baja de Maquinaria</h2>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Código de la maquinaria"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onBlur={buscarMaquinaria}
            />
          </div>
          {nombre && (
            <div className="mb-3">
              <strong>Nombre:</strong> {nombre}
            </div>
          )}
          <button className="btn btn-danger w-100 mb-3" onClick={handleBaja} disabled={!nombre}>
            Dar de baja
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

export default BajaMaquinaria;
