import React, { useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import './bajaMaquinaria.css';

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
      <div className="baja-maquinaria-container">
        <div className="baja-maquinaria-box">
          <h1 className="baja-maquinaria-title">Baja de Maquinaria</h1>
          <div className="form-group">
            <label className="form-label" htmlFor="nombre">
              Nombre de la maquinaria
            </label>
            <input
              id="nombre"
              type="text"
              className="form-input"
              placeholder="Nombre de la maquinaria"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button className="baja-maquinaria-button" onClick={handleEliminar}>
            Eliminar
          </button>
          {mensaje && <p className="baja-maquinaria-message">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
};

export default BajaMaquinaria;