import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';

const BajaCategoria: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const rol = localStorage.getItem('usuarioRol');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('http://localhost:5000/categorias-activas');
        const data = await res.json();
        setCategorias(data);
      } catch {
        setError('Error al obtener las categorías.');
      }
    };
    fetchCategorias();
  }, []);

  if (rol !== 'administrador') {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            Solo el administrador puede dar de baja categorías.
          </div>
        </div>
      </div>
    );
  }

  const handleBajaCategoria = async () => {
    setMensaje('');
    setError('');
    if (!categoriaId) {
      setError('Por favor, seleccione una categoría.');
      return;
    }
    const categoria = categorias.find((c) => c.id === parseInt(categoriaId));
    try {
      const response = await fetch('http://localhost:5000/categoria/baja', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: categoria.nombre }),
      });
      const resData = await response.json();
      if (response.ok) {
        setMensaje(resData.message || 'Categoría dada de baja correctamente.');
        setCategorias(categorias.filter((c) => c.id !== categoria.id));
        setCategoriaId('');
      } else {
        setError(resData.error || 'No se pudo dar de baja la categoría.');
      }
    } catch (error) {
      setError('Hubo un problema al dar de baja la categoría.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="baja-cuenta-page d-flex justify-content-center align-items-center" style={{ width: '100vw', height: '70vh' }}>
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid orange' }}>
          <h2 className="text-center mb-4">Baja de categoría</h2>
          <div className="mb-3">
            <select
              className="form-control"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Seleccioná una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-warning w-100 mb-3" onClick={handleBajaCategoria} disabled={!categoriaId}>
            Dar de baja categoría
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

export default BajaCategoria;