import React, { useState, useEffect } from 'react';
import EditMaquinariaModal from './detalleMaquinariaModal.tsx';
import MaquinariaInfo from './maquinariaInfo';
import MaquinariaCalendario from './maquinariaCalendario';
import { useDetalleMaquinariaContent } from './maquinariaFetch.tsx';
import StarRating from '../../Components/StarRating';
import CalificacionModal from './CalificacionModal';
import PreguntaModal from './PreguntaModal';
import MantenimientoModal from './MantenimientoModal';
import { useLocation, useNavigate } from 'react-router-dom';

const DetalleMaquinariaContent: React.FC = () => {
  const {
    maquinaria, setMaquinaria, rol, showEditModal, setShowEditModal,
    editNombre, setEditNombre, editDescripcion, setEditDescripcion,
    editPrecio, setEditPrecio, setEditFoto,
    editPoliticas, setEditPoliticas, editCategoriaId, setEditCategoriaId,
    categorias, editError, setEditError, noEncontrada,
    rangoFechas, setRangoFechas, fechasReservadas,
    showCalificacionModal, setShowCalificacionModal,
    calificacionPuntaje, setCalificacionPuntaje,
    calificacionComentario, setCalificacionComentario,
    handleCalificacionSubmit,
    showPreguntaModal,
    setShowPreguntaModal,
    preguntaTexto,
    setPreguntaTexto,
    respuestaTexto,
    setRespuestaTexto,
    handlePreguntaSubmit,
    handleRespuestaSubmit,
    abrirModalRespuesta,
    setPreguntaSeleccionada,
    preguntaSeleccionada,
    showMantenimientoModal,
    setShowMantenimientoModal,
    mantenimientoDescripcion,
    setMantenimientoDescripcion,
    handleMantenimientoSubmit
  } = useDetalleMaquinariaContent();

  const location = useLocation();
  const navigate = useNavigate();

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Lógica para abrir el modal de calificación solo si está logueado
  const handleAbrirCalificacion = () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) {
      // Redirigir a login con redirect a la URL actual
      const redirectUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setShowCalificacionModal(true);
  };

  // Bandera para saber si se acaba de calificar
  const [justCalified, setJustCalified] = useState(false);

  // Evitar que el modal de calificación se vuelva a abrir si ya calificó
  const removeCalificarParam = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('calificar') === '1') {
      params.delete('calificar');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      setJustCalified(true);
    }
  };

  // Si el usuario va para atrás después de calificar, redirigir a /servicios
  useEffect(() => {
    if (!justCalified) return;
    const handlePopState = () => {
      navigate('/servicios', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [justCalified, navigate]);

  useEffect(() => {
    // Si la URL contiene ?calificar=1, abrir el modal de calificación solo si está logueado
    const params = new URLSearchParams(location.search);
    if (params.get('calificar') === '1') {
      handleAbrirCalificacion();
    }
    // Solo ejecutar al montar
    // eslint-disable-next-line
  }, []);

  const [showMPError, setShowMPError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFechaModal, setShowFechaModal] = useState(false);
  const [showMinDiasError, setShowMinDiasError] = useState(false);

  // Nuevo estado para checkbox y dirección
  const [envio, setEnvio] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [showDireccionError, setShowDireccionError] = useState(false);

  // Estados para reservar para cliente
  const [emailCliente, setEmailCliente] = useState("");
  const [errorEmailCliente, setErrorEmailCliente] = useState("");
  const [confirmacionReservaCliente, setConfirmacionReservaCliente] = useState("");
  const [showReservaClienteModal, setShowReservaClienteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    const usuarioNombre = sessionStorage.getItem('usuarioNombre');
    const usuarioEmail = sessionStorage.getItem('usuarioEmail');
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
    if (diasSeleccionados < 7) {
      setShowMinDiasError(true);
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
    if (maquinaria) {
      setEditNombre(maquinaria.nombre);
      setEditDescripcion(maquinaria.descripcion);
      setEditPrecio(maquinaria.precio);
      setEditPoliticas(maquinaria.politicas_reembolso?.toString() || '');
      setEditCategoriaId(maquinaria.categoria_id?.toString() || '');
      setShowEditModal(true);
    }
  };

  const [modoAgregarMantenimiento, setModoAgregarMantenimiento] = useState(false);
  const [showMantenimientoSuccess, setShowMantenimientoSuccess] = useState(false);

  const abrirInputEmail = () => {
    setEmailCliente("");
    setErrorEmailCliente("");
    setConfirmacionReservaCliente("");
    setShowEmailModal(true);
  };

  const reservarParaCliente = rol === 'empleado';

  const confirmarReservaCliente = async () => {
    setErrorEmailCliente("");
    setConfirmacionReservaCliente("");
    if (!emailCliente) {
      setErrorEmailCliente("Debes ingresar un email.");
      return;
    }
    // Validar email en backend
    try {
      const resp = await fetch(`http://localhost:5000/usuario?email=${encodeURIComponent(emailCliente)}`);
      if (!resp.ok) {
        setErrorEmailCliente("No existe un cliente con ese email.");
        return;
      }
      const data = await resp.json();
      if (data.rol !== 'cliente') {
        setErrorEmailCliente("El email ingresado no corresponde a un cliente.");
        return;
      }
      // Confirmar reserva
      if (!maquinaria || !fechaInicio || !fechaFin) {
        setShowFechaModal(true);
        return;
      }
      if (diasSeleccionados < 7) {
        setErrorEmailCliente("El mínimo de días para la reserva es 7.");
        return;
      }
      // Realizar reserva para cliente directamente (sin pago)
      const response = await fetch('http://localhost:5000/api/reservas/empleado-para-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: maquinaria.nombre,
          precio: montoTotal,
          codigo_maquinaria: maquinaria.codigo,
          fecha_inicio: fechaInicio.toISOString().slice(0, 10),
          fecha_fin: fechaFin.toISOString().slice(0, 10),
          usuario_email: emailCliente,
          envio: envio,
          direccion: envio ? direccion : null,
        }),
      });
      if (response.ok) {
        setConfirmacionReservaCliente("Se registró el alquiler para el cliente con éxito");
        setShowEmailModal(false);
        setEmailCliente("");
        setShowReservaClienteModal(true);
        setErrorEmailCliente("");
      } else {
        setErrorEmailCliente("Error al crear la reserva para el cliente.");
      }
    } catch (err) {
      setErrorEmailCliente("Error al validar el email o crear la reserva.");
    }
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
      {/* Scrollbar custom styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #bdbdbd #fff;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #fff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #bdbdbd;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff;
        }
      `}</style>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="row bg-white shadow-sm rounded p-4 align-items-stretch" style={{ minHeight: '550px' }}>
            <MaquinariaInfo
              maquinaria={maquinaria}
              openEditModal={openEditModal}
              rol={rol}
            />
            <div className="col-md-5 d-flex flex-column">
              {/* Botones de mantenimiento */}
              {(rol === 'empleado' || rol === 'administrador') && (
                <div className="d-flex gap-2 mb-4">
                  {/* Solo empleados pueden agregar mantenimiento */}
                  {rol === 'empleado' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setMantenimientoDescripcion('');
                        setModoAgregarMantenimiento(true);
                        setShowMantenimientoModal(true);
                      }}
                    >
                      Agregar Mantenimiento
                    </button>
                  )}
                  {/* Tanto empleados como administradores pueden ver historial */}
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setModoAgregarMantenimiento(false);
                      setShowMantenimientoModal(true);
                    }}
                  >
                    Ver Historial
                  </button>
                </div>
              )}

              {/* Nombre y código arriba del precio */}
              <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
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
              {/* Calificaciones */}
              <div className="mb-3">
                {maquinaria.calificaciones ? (
                  <div>
                    <StarRating rating={maquinaria.calificaciones.promedio} readonly size={24} />
                    <small className="text-muted ms-2">
                      ({maquinaria.calificaciones.total_calificaciones} calificaciones)
                    </small>
                  </div>
                ) : (
                  <div className="text-muted">Sin calificaciones</div>
                )}
              </div>
              {/* Precio por día en verde arriba del calendario */}
              <div style={{ marginBottom: "5%" }}>
                <span className="fw-bold" style={{ color: "#198754", fontSize: "2.0rem" }}>
                  ${maquinaria.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-muted ms-2" style={{ fontSize: '1rem' }}>
                  por día
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
                reservarParaCliente={reservarParaCliente}
                abrirInputEmail={abrirInputEmail}
                mostrarInputEmail={false}
                emailCliente={emailCliente}
                setEmailCliente={setEmailCliente}
                confirmarReservaCliente={confirmarReservaCliente}
                errorEmailCliente={errorEmailCliente}
                confirmacionReservaCliente={confirmacionReservaCliente}
                setShowFechaModal={setShowFechaModal}
                envio={envio}
                setEnvio={setEnvio}
                direccion={direccion}
                setDireccion={setDireccion}
                showDireccionError={showDireccionError}
                setShowDireccionError={setShowDireccionError}
                setShowMinDiasError={setShowMinDiasError}
                setConfirmacionReservaCliente={setConfirmacionReservaCliente}
              />
              {/* Política de reembolso debajo del checkbox */}
              <div style={{ marginTop: 0, marginBottom: '1rem' }}>
                <span className="fw-bold">Política de reembolso: </span>
                <span>Si desea cancelar una reserva de esta maquinaria el reembolso será del </span>
                <span className='fw-bold'>
                  {maquinaria.politicas_reembolso !== null && maquinaria.politicas_reembolso !== undefined
                    ? `${maquinaria.politicas_reembolso}%`
                    : '-'}
                </span>
                <span> (Siempre y cuando esta no sea en mismo dia de retiro)</span>
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

          {/* NUEVO: Sección de preguntas y calificaciones en dos columnas */}
          <div className="row mt-4" style={{gap: 0}}>
            {/* Preguntas (izquierda, 60%) */}
            <div className="col-12 col-md-7 mb-4 mb-md-0">
              <div className="shadow-sm rounded p-4 h-100 d-flex flex-column"
                style={{ border: '2.5px solid #d32f2f', background: '#fff', color: '#222' }}>
                <h4>Preguntas y Respuestas</h4>
                {/* Botón de pregunta para clientes */}
                {rol === 'cliente' && (
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => setShowPreguntaModal(true)}
                    >
                      Hacer una pregunta
                    </button>
                  </div>
                )}
                <div
                  className="mt-3 custom-scrollbar"
                  style={{
                    maxHeight: '480px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    paddingRight: '8px',
                  }}
                >
                  {(maquinaria.preguntas || []).map((preg, idx, arr) => (
                    <React.Fragment key={preg.id}>
                      <div
                        style={{
                          background: '#f8f9fa',
                          border: '2px solid #bdbdbd',
                          borderRadius: '10px',
                          padding: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          color: '#222',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <strong>{preg.usuario_email || '-'}</strong>
                            <small className="text-muted ms-2">
                              {new Date(preg.fecha_pregunta).toLocaleDateString()}
                            </small>
                          </div>
                          {rol === 'empleado' && !preg.respuesta && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => abrirModalRespuesta(preg.id, preg.pregunta)}
                            >
                              Responder
                            </button>
                          )}
                        </div>
                        <p className="mt-2 mb-0">{preg.pregunta}</p>
                        {preg.respuesta && (
                          <div
                            className="mt-2 ps-3 border-start"
                            style={{
                              background: '#e5e7eb',
                              borderRadius: '6px',
                              padding: '10px 12px',
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{preg.empleado_email || '-'}</strong>
                                <small className="text-muted ms-2">
                                  {preg.fecha_respuesta ? new Date(preg.fecha_respuesta).toLocaleDateString() : ''}
                                </small>
                              </div>
                            </div>
                            <p className="mt-2 mb-0">{preg.respuesta}</p>
                          </div>
                        )}
                      </div>
                      {idx < arr.length - 1 && (
                        <div style={{ borderTop: '2px solid #e0e0e0', margin: '8px 0' }}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            {/* Calificaciones (derecha, 40%) */}
            <div className="col-12 col-md-5">
              {maquinaria.calificaciones && maquinaria.calificaciones.calificaciones.length > 0 && (
                <div className="shadow-sm rounded p-4 h-100 d-flex flex-column"
                  style={{ border: '2.5px solid #d32f2f', background: '#fff', color: '#222' }}>
                  <h4>Comentarios</h4>
                  <div
                    className="mt-3 custom-scrollbar"
                    style={{
                      maxHeight: '480px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingRight: '8px',
                    }}
                  >
                    {maquinaria.calificaciones.calificaciones.slice(0, 10).map((cal, idx, arr) => (
                      <React.Fragment key={cal.id}>
                        <div
                          style={{
                            background: '#fafbfc',
                            border: '2px solid #bdbdbd',
                            borderRadius: '10px',
                            padding: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: '#222',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <strong>{cal.usuario_nombre}</strong>
                              <StarRating rating={cal.puntaje} readonly size={16} />
                            </div>
                            <small className="text-muted">{new Date(cal.fecha).toLocaleDateString()}</small>
                          </div>
                          {cal.comentario && (
                            <p className="mt-2 mb-0">{cal.comentario}</p>
                          )}
                        </div>
                        {idx < arr.length - 1 && (
                          <div style={{ borderTop: '2px solid #e0e0e0', margin: '8px 0' }}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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

      {/* Modal: Mínimo 7 días de reserva */}
      {showMinDiasError && (
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
                <p>La reserva debe ser de al menos 7 días.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowMinDiasError(false)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de calificación */}
      <CalificacionModal
        show={showCalificacionModal}
        onClose={() => setShowCalificacionModal(false)}
        onSubmit={async () => {
          // Lógica de calificación con toast de éxito
          const usuarioId = sessionStorage.getItem('usuarioId');
          if (!usuarioId) {
            setShowCalificacionModal(false);
            // Redirigir a login con redirect a la URL actual
            const redirectUrl = window.location.pathname + window.location.search;
            navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
          }
          try {
            const response = await fetch(`http://localhost:5000/calificar-maquinaria/${maquinaria.codigo}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                puntaje: calificacionPuntaje,
                comentario: calificacionComentario,
                usuario_id: parseInt(usuarioId)
              }),
            });
            if (response.ok) {
              setShowCalificacionModal(false);
              setCalificacionPuntaje(0);
              setCalificacionComentario('');
              // Recargar calificaciones
              const calificacionesResponse = await fetch(`http://localhost:5000/calificaciones-maquinaria/${maquinaria.codigo}`);
              const calificaciones = await calificacionesResponse.json();
              setMaquinaria(prev => prev ? { ...prev, calificaciones } : null);
              setShowSuccessToast(true);
              removeCalificarParam();
            } else {
              const error = await response.json();
              setShowCalificacionModal(false);
              setShowSuccessToast(true);
              removeCalificarParam();
            }
          } catch (error) {
            setShowCalificacionModal(false);
            setShowSuccessToast(true);
            removeCalificarParam();
          }
        }}
        puntaje={calificacionPuntaje}
        setPuntaje={setCalificacionPuntaje}
        comentario={calificacionComentario}
        setComentario={setCalificacionComentario}
      />

      {/* Modal de preguntas */}
      <PreguntaModal
        show={showPreguntaModal}
        onClose={() => {
          setShowPreguntaModal(false);
          setPreguntaTexto('');
          setRespuestaTexto('');
          setPreguntaSeleccionada(null);
        }}
        onSubmit={preguntaSeleccionada ? handleRespuestaSubmit : handlePreguntaSubmit}
        pregunta={preguntaSeleccionada ? maquinaria.preguntas?.find(p => p.id === preguntaSeleccionada)?.pregunta || '' : preguntaTexto}
        setPregunta={preguntaSeleccionada ? () => {} : setPreguntaTexto}
        respuesta={respuestaTexto}
        setRespuesta={setRespuestaTexto}
        esEmpleado={!!preguntaSeleccionada}
      />

      {/* Modal de mantenimiento */}
      <MantenimientoModal
        show={showMantenimientoModal}
        onClose={() => {
          setShowMantenimientoModal(false);
          setMantenimientoDescripcion('');
        }}
        onSubmit={async () => {
          await handleMantenimientoSubmit();
          setShowMantenimientoModal(false);
          setMantenimientoDescripcion('');
          setShowMantenimientoSuccess(true);
          setTimeout(() => setShowMantenimientoSuccess(false), 3000);
        }}
        descripcion={mantenimientoDescripcion}
        setDescripcion={setMantenimientoDescripcion}
        historial={maquinaria.historial_mantenimiento}
        modoAgregar={modoAgregarMantenimiento}
      />

      {/* Mensaje de éxito al agregar mantenimiento */}
      {showMantenimientoSuccess && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className="toast show"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header bg-success text-white">
              <strong className="me-auto">Éxito</strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowMantenimientoSuccess(false)}
              ></button>
            </div>
            <div className="toast-body">
              El mantenimiento se ha agregado correctamente.
            </div>
          </div>
        </div>
      )}

      {/* Modal para ingresar email del cliente */}
      {showEmailModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reservar para Cliente</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailCliente("");
                    setErrorEmailCliente("");
                    setConfirmacionReservaCliente("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">Ingresa el email del cliente para quien deseas realizar la reserva:</p>
                <div className="mb-3">
                  <label htmlFor="emailClienteInput" className="form-label">Email del cliente:</label>
                  <input
                    type="email"
                    id="emailClienteInput"
                    className="form-control"
                    placeholder="cliente@ejemplo.com"
                    value={emailCliente}
                    onChange={e => setEmailCliente(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        confirmarReservaCliente();
                      }
                    }}
                  />
                  {errorEmailCliente && (
                    <div className="text-danger mt-2">{errorEmailCliente}</div>
                  )}
                </div>
                {diasSeleccionados > 0 && (
                  <div className="alert alert-info">
                    <strong>Resumen de la reserva:</strong><br/>
                    Días: {diasSeleccionados}<br/>
                    Monto total: ${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    {envio && <><br/>Envío: Sí<br/>Dirección: {direccion}</>}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailCliente("");
                    setErrorEmailCliente("");
                    setConfirmacionReservaCliente("");
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmarReservaCliente}
                  disabled={!emailCliente || (envio && direccion.trim() === '')}
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito para reserva de cliente */}
      {showReservaClienteModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-success">¡Éxito!</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowReservaClienteModal(false);
                  setConfirmacionReservaCliente("");
                  setEmailCliente("");
                  setErrorEmailCliente("");
                  window.location.reload();
                }}></button>
              </div>
              <div className="modal-body">
                <p>Se registró el alquiler para el cliente con éxito</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de éxito al calificar */}
      {showSuccessToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <strong className="me-auto">¡Gracias!</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowSuccessToast(false)}></button>
            </div>
            <div className="toast-body">
              ¡Gracias por tu calificación!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleMaquinariaContent;