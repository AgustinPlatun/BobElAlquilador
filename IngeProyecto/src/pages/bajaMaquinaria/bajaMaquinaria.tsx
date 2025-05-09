import React, { useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';

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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Baja de Maquinaria</h1>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Nombre de la maquinaria"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #ccc',
              width: '300px',
            }}
          />
        </div>
        <button
          onClick={handleEliminar}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ff3333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Eliminar
        </button>
        {mensaje && <p style={{ marginTop: '1rem', color: 'red' }}>{mensaje}</p>}
      </div>
    </div>
  );
};

export default BajaMaquinaria;