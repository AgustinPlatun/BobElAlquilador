import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';

const BajaMaquinaria: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<any[]>([]);
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const rol = localStorage.getItem('usuarioRol');

  // Obtener todas las maquinarias activas al montar
  useEffect(() => {
    const fetchMaquinarias = async () => {
      try {
        const res = await fetch('http://localhost:5000/maquinarias');
        const data = await res.json();
        setMaquinarias(data);
      } catch {
        setError('Error al obtener las maquinarias.');
      }
    };
    fetchMaquinarias();
  }, []);

  // Cuando selecciona una maquinaria, guarda su código y nombre
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCodigo = e.target.value;
    setCodigo(selectedCodigo);
    const maq = maquinarias.find((m) => m.codigo === selectedCodigo);
    setMensaje('');
    setError('');
  };

  // Dar de baja
  const handleBaja = async () => {
    setError('');
    setMensaje('');
    try {
      const response = await fetch('http://localhost:5000/baja-maquinaria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      if (response.ok) {
        setMensaje('Maquinaria dada de baja correctamente.');
        setCodigo('');
        setMaquinarias(maquinarias.filter((m) => m.codigo !== codigo));
      } else {
        const data = await response.json();
        setError(data.message || 'No se pudo dar de baja la maquinaria.');
      }
    } catch {
      setError('Hubo un problema al dar de baja la maquinaria.');
    }
    setShowConfirmModal(false);
  };

  return (
    <div>
      <Navbar />
      <div className="baja-maquinaria-page d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid red' }}>
          <h2 className="text-center mb-4">Baja de Maquinaria</h2>
          <div className="mb-3">
            <select
              className="form-control"
              value={codigo}
              onChange={handleSelect}
            >
              <option value="">Seleccioná una maquinaria</option>
              {maquinarias.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nombre} ({m.codigo})
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-danger w-100 mb-3"
            onClick={() => setShowConfirmModal(true)}
            disabled={!codigo}
          >
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

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar baja</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Está seguro de que desea dar de baja la maquinaria <strong>{codigo}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleBaja}>
                  Confirmar baja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BajaMaquinaria;
