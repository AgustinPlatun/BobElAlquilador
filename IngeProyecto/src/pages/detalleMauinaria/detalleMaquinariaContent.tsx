import React from 'react';
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
      alert('Debes iniciar sesión para alquilar.');
      navigate('/login');
      return;
    }
    if (!maquinaria) return;
    if (!fechaInicio || !fechaFin) {
      alert('Seleccioná un rango de fechas para reservar.');
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
              {/* Política de reembolso debajo del botón de reserva */}
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
    </div>
  );
};

export default DetalleMaquinariaContent;