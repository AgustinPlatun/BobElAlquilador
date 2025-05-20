import React, { useState } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="bg-white border border-danger rounded shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center text-dark mb-4">Alta de Maquinaria</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre:</label>
              <input
                type="text"
                id="nombre"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción:</label>
              <textarea
                id="descripcion"
                className="form-control"
                rows={5}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="foto" className="form-label">Foto:</label>
              <input
                type="file"
                id="foto"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button type="submit" className="btn btn-danger w-100 mt-3">Dar Alta Maquinaria</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AltaMaquinaria;
