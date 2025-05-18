import React, { useState } from 'react';
import Navbar from '../Components/Navbar';

const BajaMaquinaria: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleEliminar = async () => {
    if (!nombre) {
      alert('Por favor, ingrese el nombre de la maquinaria.');
      return;
    }

    const confirmacion = window.confirm(`¿Está seguro de eliminar la maquinaria "${nombre}"?`);
    if (!confirmacion) return;

    try {
      const response = await fetch('http://localhost:5000/baja-maquinaria', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      if (response.ok) {
        setMensaje('Maquinaria eliminada correctamente.');
        setNombre('');
      } else {
        setMensaje('No se pudo eliminar la maquinaria. Verifique el nombre.');
      }
    } catch (error) {
      console.error('Error al eliminar la maquinaria:', error);
      setMensaje('Hubo un problema al eliminar la maquinaria.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center mb-4">Baja de Maquinaria</h2>

          <div className="mb-3">
            <input
              id="nombre"
              type="text"
              className="form-control"
              placeholder="Nombre de la maquinaria"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <button className="btn btn-danger w-100 mb-3" onClick={handleEliminar}>
            Eliminar
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

export default BajaMaquinaria;
