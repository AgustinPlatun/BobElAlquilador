import React, { useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import './AltaMaquinaria.css';

const AltaMaquinaria: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFoto(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !descripcion || !foto) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      formData.append('foto', foto);

      // Enviar datos al backend
      const response = await fetch('http://localhost:5000/alta-maquinaria', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Maquinaria dada de alta correctamente.');
        setNombre('');
        setDescripcion('');
        setFoto(null);
      } else {
        setError('Hubo un problema al dar de alta la maquinaria.');
      }
    } catch (error) {
      console.error('Error al dar de alta la maquinaria:', error);
      setError('Hubo un problema al dar de alta la maquinaria.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="alta-maquinaria-container">
        <div className="alta-maquinaria-box">
          <h2 className="alta-maquinaria-title">Alta de Maquinaria</h2>
          <form className="alta-maquinaria-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre:</label>
              <input
                type="text"
                id="nombre"
                className="form-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">Descripción:</label>
              <textarea
                id="descripcion"
                className="form-input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="foto" className="form-label">Foto:</label>
              <input
                type="file"
                id="foto"
                className="form-input"
                onChange={handleFileChange}
              />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" className="alta-maquinaria-button">Dar Alta Maquinaria</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AltaMaquinaria;