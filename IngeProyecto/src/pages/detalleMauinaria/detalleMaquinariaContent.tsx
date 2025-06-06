import React, { useState } from 'react';
import EditMaquinariaModal from './detalleMaquinariaModal.tsx';
import MaquinariaInfo from './maquinariaInfo';
import MaquinariaCalendario from './maquinariaCalendario';
import { useDetalleMaquinariaContent } from './maquinariaFetch.tsx';

const DetalleMaquinariaContent: React.FC = () => {
  const {
    maquinaria, rol, showEditModal, setShowEditModal,
    editNombre, setEditNombre, editDescripcion, setEditDescripcion,
    editPrecio, setEditPrecio, editFoto, setEditFoto,
    editPoliticas, setEditPoliticas, editCategoriaId, setEditCategoriaId,
    categorias, editError, setEditError, noEncontrada,
    rangoFechas, setRangoFechas, fechasReservadas, navigate
  } = useDetalleMaquinariaContent();

  const [showMPError, setShowMPError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFechaModal, setShowFechaModal] = useState(false);

  // Nuevo estado para checkbox y dirección
  const [envio, setEnvio] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [showDireccionError, setShowDireccionError] = useState(false);

  const [fechaInicio, fechaFin] = rangoFechas;

  const calcularDias = () => {
    if (fechaInicio && fechaFin) {
      return Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const diasSeleccionados = calcularDias();
  const montoTotal = maquinaria ? (maquinaria.precio * diasSeleccionados) : 0;

  const handleAlquilar = async () => {
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioEmail = localStorage.getItem('usuarioEmail');
    if (!usuarioNombre) {
      setShowLoginModal(true);
      return;
    }
    if (!maquinaria) return;
    if (!fechaInicio || !fechaFin) {
      setShowFechaModal(true);
      return;
    }
    if (envio && direccion.trim() === '') {
      setShowDireccionError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: maquinaria.nombre,
          precio: montoTotal,
          codigo_maquinaria: maquinaria.codigo,
          fecha_inicio: fechaInicio.toISOString().slice(0, 10),
          fecha_fin: fechaFin.toISOString().slice(0, 10),
          usuario_email: usuarioEmail,
          envio: envio,
          direccion: envio ? direccion : null,
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setShowMPError(true); // Mostrar modal de error
      }
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
      setShowMPError(true);
    }
  };

  const openEditModal = () => {
    setEditNombre(maquinaria?.nombre || '');
    setEditDescripcion(maquinaria?.descripcion || '');
    setEditPrecio(maquinaria?.precio || 0);
    setEditFoto(null);
    setEditPoliticas(maquinaria?.politicas_reembolso || '');
    setEditCategoriaId(maquinaria?.categoria_id ? String(maquinaria.categoria_id) : '');
    setEditError('');
    setShowEditModal(true);
  };

  if (noEncontrada) {
    return (
      <div className="text-center py-5 text-danger">
        No se encontró la maquinaria solicitada.
      </div>
    );
  }

  if (!maquinaria) return <div className="text-center py-5">Cargando...</div>;

  return (
    <div className="container py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="row bg-white shadow-sm rounded p-4 align-items-stretch" style={{ minHeight: '550px' }}>
            <MaquinariaInfo
              maquinaria={maquinaria}
              openEditModal={openEditModal}
              rol={rol}
            />
            <div className="col-md-5 d-flex flex-column ">
              {/* Nombre y código arriba del precio */}
              <div>
                <span className="fw-bold" style={{ fontSize: "1.8rem" }}>
                  {maquinaria.nombre}
                </span>
                <span className="badge bg-secondary ms-2" style={{ fontSize: "0.9rem", verticalAlign: "middle" }}>
                  {maquinaria.codigo}
                </span>
              </div>
              {/* Categoría en gris debajo del nombre */}
              <div style={{ fontSize: "0.95rem", color: "#6c757d", marginBottom: "5%" }}>
                {maquinaria.categoria && maquinaria.categoria.trim() !== '' ? maquinaria.categoria : '-'}
              </div>
              {/* Precio por día en verde arriba del calendario */}
              <div style={{ marginBottom: "5%" }}>
                <span className="fw-bold" style={{ color: "#198754", fontSize: "2.0rem" }}>
                  ${maquinaria.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <MaquinariaCalendario
                rol={rol}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                setRangoFechas={setRangoFechas}
                fechasReservadas={fechasReservadas}
                diasSeleccionados={diasSeleccionados}
                montoTotal={montoTotal}
                handleAlquilar={handleAlquilar}
              />
              {/* Checkbox de envío debajo del botón de reservar */}
              <div>
                <div className="form-check mb-3 mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="envioCheckbox"
                    checked={envio}
                    onChange={e => {
                      setEnvio(e.target.checked);
                      if (!e.target.checked) setDireccion('');
                      setShowDireccionError(false);
                    }}
                  />
                  <label className="form-check-label" htmlFor="envioCheckbox">
                    Envío
                  </label>
                </div>
                {/* Campo de dirección si envío está activado */}
                {envio && (
                  <div className="mb-4">
                    <label htmlFor="direccionEnvio" className="form-label">Dirección de envío:</label>
                    <input
                      type="text"
                      id="direccionEnvio"
                      className="form-control"
                      value={direccion}
                      onChange={e => {
                        setDireccion(e.target.value);
                        setShowDireccionError(false);
                      }}
                      placeholder="Ingresá la dirección"
                    />
                    {showDireccionError && (
                      <div className="text-danger mt-1">Debes ingresar una dirección para el envío.</div>
                    )}
                  </div>
                )}
              </div>
              {/* Política de reembolso debajo del checkbox */}
              <div style={{ marginTop: 0 }}>
                <span className="fw-bold">Política de reembolso: </span>
                <span>
                  {maquinaria.politicas_reembolso && maquinaria.politicas_reembolso.trim() !== ''
                    ? maquinaria.politicas_reembolso
                    : '-'}
                </span>
              </div>
              {rol === 'administrador' && (
                <button
                  className="btn btn-warning fw-bold"
                  style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start', marginTop: 0 }}
                  onClick={openEditModal}
                >
                  Editar Maquinaria
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {maquinaria.descripcion && (
        <div className="row justify-content-center mt-4">
          <div className="col-lg-10">
            <div className="bg-white shadow-sm rounded p-4" style={{ minWidth: 0 }}>
              <h5 className="fw-bold mb-2">Descripción</h5>
              <p style={{ fontSize: '1.1rem' }}>{maquinaria.descripcion}</p>
            </div>
          </div>
        </div>
      )}
      <EditMaquinariaModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        editNombre={editNombre}
        setEditNombre={setEditNombre}
        editDescripcion={editDescripcion}
        setEditDescripcion={setEditDescripcion}
        editPrecio={editPrecio}
        setEditPrecio={setEditPrecio}
        editFoto={setEditFoto}
        editPoliticas={editPoliticas}
        setEditPoliticas={setEditPoliticas}
        editCategoriaId={editCategoriaId}
        setEditCategoriaId={setEditCategoriaId}
        categorias={categorias}
        editError={editError}
        setEditError={setEditError}
        maquinaria={maquinaria}
        navigate={navigate}
        setShowEditModal={setShowEditModal}
      />

      {/* Modal: Debes iniciar sesión */}
      {showLoginModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Atención</h5>
              </div>
              <div className="modal-body">
                <p>Debes iniciar sesión para alquilar.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Seleccioná un rango de fechas */}
      {showFechaModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Atención</h5>
              </div>
              <div className="modal-body">
                <p>Seleccioná un rango de fechas para reservar.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowFechaModal(false)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error de MercadoPago */}
      {showMPError && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Error</h5>
              </div>
              <div className="modal-body">
                <p>No se pudo conectar con el servidor de MercadoPago.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowMPError(false)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleMaquinariaContent;