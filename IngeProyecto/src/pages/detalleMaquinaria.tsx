import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';

interface Maquinaria {
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
  codigo: string;
}

const DetalleMaquinaria: React.FC = () => {
  const { nombre } = useParams();
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombre, setEditNombre] = useState(maquinaria?.nombre || '');
  const [editDescripcion, setEditDescripcion] = useState(maquinaria?.descripcion || '');
  const [editPrecio, setEditPrecio] = useState(maquinaria?.precio || 0);
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/maquinarias')
      .then(res => res.json())
      .then(data => {
        const found = data.find((m: Maquinaria) => m.nombre === nombre);
        setMaquinaria(found);
      });

    const storedRol = localStorage.getItem('usuarioRol');
    setRol(storedRol);
  }, [nombre]);

  const handleAlquilar = async () => {
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const rol = localStorage.getItem('usuarioRol');
    if (!usuarioNombre) {
      alert('Debes iniciar sesión para alquilar.');
      navigate('/login');
      return;
    }
    if (!maquinaria) return;

    try {
      const response = await fetch('http://localhost:5000/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: maquinaria.nombre,
          precio: maquinaria.precio,
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('No se pudo iniciar el proceso de pago.');
      }
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
      alert('Hubo un error al procesar el pago.');
    }
  };

  // Cuando abras el modal, inicializa los valores:
  const openEditModal = () => {
    setEditNombre(maquinaria?.nombre || '');
    setEditDescripcion(maquinaria?.descripcion || '');
    setEditPrecio(maquinaria?.precio || 0);
    setEditFoto(null);
    setEditError('');
    setShowEditModal(true);
  };

  if (!maquinaria) return <div className="text-center py-5">Cargando...</div>;

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="row bg-white shadow-sm rounded p-4 align-items-stretch" style={{ minHeight: '550px' }}>
              <div className="col-md-7 d-flex align-items-center justify-content-center border-end">
                <img
                  src={`http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}`}
                  alt={maquinaria.nombre}
                  className="img-fluid"
                  style={{
                    width: '80%',
                    height: '80%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div className="col-md-5 d-flex flex-column justify-content-between">
                <div>
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.8rem' }}>
                    {maquinaria.nombre}
                    <span className="badge bg-secondary ms-2" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>
                      {maquinaria.codigo}
                    </span>
                  </h2>
                  <h3 className="text-success fw-bold mb-3" style={{ fontSize: '2rem' }}>
                    ${maquinaria.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">Descripción</h5>
                    <p style={{ fontSize: '1.1rem' }}>{maquinaria.descripcion}</p>
                  </div>
                </div>
                {rol !== 'administrador' && (
                  <button
                    className="btn btn-danger fw-bold"
                    style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
                    onClick={handleAlquilar}
                  >
                    Reservar
                  </button>
                )}
                {rol === 'administrador' && (
                  <button
                    className="btn btn-warning fw-bold mt-3"
                    style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
                    onClick={openEditModal}
                  >
                    Editar Maquinaria
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Maquinaria</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEditError('');
                    if (!editNombre || !editDescripcion || !editPrecio) {
                      setEditError('Todos los campos son obligatorios.');
                      return;
                    }
                    const formData = new FormData();
                    formData.append('nombre', editNombre);
                    formData.append('descripcion', editDescripcion);
                    formData.append('precio', String(editPrecio));
                    if (editFoto) formData.append('foto', editFoto);

                    const response = await fetch(`http://localhost:5000/editar-maquinaria/${maquinaria.codigo}`, {
                      method: 'PUT',
                      body: formData,
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setShowEditModal(false);
                      // Si el nombre cambió, navega a la nueva URL
                      if (data.maquinaria && data.maquinaria.nombre !== maquinaria.nombre) {
                        navigate(`/detalle-maquinaria/${encodeURIComponent(data.maquinaria.nombre)}`);
                        window.location.reload();
                      } else {
                        window.location.reload();
                      }
                    } else {
                      setEditError(data.message || 'Hubo un problema al editar la maquinaria.');
                    }
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <input type="number" className="form-control" value={editPrecio} onChange={e => setEditPrecio(Number(e.target.value))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Foto (opcional)</label>
                    <input type="file" className="form-control" onChange={e => setEditFoto(e.target.files?.[0] || null)} />
                  </div>
                  {editError && <div className="alert alert-danger">{editError}</div>}
                  <button type="submit" className="btn btn-warning">Guardar Cambios</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetalleMaquinaria;
