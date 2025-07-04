import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const AltaMaquinaria: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [precio, setPrecio] = useState('');
  const [codigo, setCodigo] = useState('');
  const [politicas, setPoliticas] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState('');
  const [mostrarReactivar, setMostrarReactivar] = useState(false);
  const [nombreExistente, setNombreExistente] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Cargar categorías activas
    fetch('http://localhost:5000/categorias-activas')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFoto(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setMostrarReactivar(false);

    if (!codigo || !nombre || !descripcion || !foto || !precio || !categoriaId || !politicas) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setError('El precio debe ser un número válido y mayor a 0.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('codigo', codigo);
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      formData.append('foto', foto);
      formData.append('precio', precio);
      formData.append('politicas_reembolso', politicas);
      if (categoriaId) formData.append('categoria_id', categoriaId);

      const response = await fetch('http://localhost:5000/alta-maquinaria', {
        method: 'POST',
        body: formData,
      });

      const errorData = await response.json();

      if (response.ok) {
        setMensaje('Maquinaria dada de alta correctamente.');
        setNombre('');
        setDescripcion('');
        setFoto(null);
        setPrecio('');
        setCodigo('');
        setPoliticas('');
        setCategoriaId('');
      } else if (errorData.reactivar) {
        setError(errorData.message);
        setNombreExistente(errorData.nombre || '');
        setMostrarReactivar(true);
      } else if (errorData.message && errorData.message.includes('código')) {
        setError('Ya existe una maquinaria con ese código.');
        setMostrarReactivar(false);
        setNombreExistente('');
      } else {
        setError('Hubo un problema al dar de alta la maquinaria.');
        setMostrarReactivar(false);
        setNombreExistente('');
      }
    } catch (error) {
      setError('Hubo un problema al dar de alta la maquinaria.');
    }
  };

  const handleReactivar = async () => {
    setError('');
    setMensaje('');
    try {
      const formData = new FormData();
      formData.append('codigo', codigo);

      const response = await fetch('http://localhost:5000/reactivar-maquinaria', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setMensaje('Maquinaria reactivada correctamente.');
        setNombre('');
        setDescripcion('');
        setFoto(null);
        setPrecio('');
        setCodigo('');
        setPoliticas('');
        setCategoriaId('');
        setMostrarReactivar(false);
        setError('');
        setNombreExistente('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'No se pudo reactivar la maquinaria.');
      }
    } catch {
      setError('Hubo un problema al reactivar la maquinaria.');
    }
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-centered">
        <div className="bg-white border border-danger rounded shadow p-4 mb-5" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 className="text-center text-dark mb-4">Alta de Maquinaria</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="codigo" className="form-label">Código único de maquinaria:</label>
              <input
                type="text"
                id="codigo"
                className="form-control"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
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
              <label htmlFor="precio" className="form-label">Precio (por día):</label>
              <input
                type="number"
                id="precio"
                className="form-control"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="form-text">El precio ingresado corresponde al valor por día de alquiler.</div>
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
            <div className="mb-3">
              <label htmlFor="categoria" className="form-label">Categoría:</label>
              <select
                id="categoria"
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="politicas" className="form-label">Políticas de reembolso:</label>
              <input
                type="text"
                id="politicas"
                className="form-control"
                value={politicas}
                onChange={(e) => setPoliticas(e.target.value)}
                placeholder="Ej: Reembolso solo por fallas técnicas"
              />
            </div>
            {!mostrarReactivar && error && <p className="text-danger">{error}</p>}
            {!mostrarReactivar && (
              <button type="submit" className="btn btn-danger w-100 mt-3">Dar Alta Maquinaria</button>
            )}
          </form>
          {mensaje && <div className="alert alert-success text-center mt-3">{mensaje}</div>}
          {mostrarReactivar && (
            <div>
              <p className="text-warning text-center mb-2">
                {`Existe una maquinaria inactiva con ese código: `}
                <span className="fw-bold">{nombreExistente}</span>
                {`. ¿Desea reactivarla?`}
              </p>
              <button className="btn btn-warning w-100 mt-2" onClick={handleReactivar}>
                Reactivar maquinaria
              </button>
              <button
                className="btn btn-secondary w-100 mt-2"
                onClick={() => {
                  setMostrarReactivar(false);
                  setError('');
                  setNombreExistente('');
                }}
              >
                Cancelar operación
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AltaMaquinaria;
