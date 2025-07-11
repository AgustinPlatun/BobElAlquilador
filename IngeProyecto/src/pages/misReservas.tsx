import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';
import CalificacionModal from './detalleMaquinaria/CalificacionModal';

interface Reserva {
  id: number;
  maquinaria_id: number;
  maquinaria_codigo: string;
  maquinaria_nombre: string;
  maquinaria_foto: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_dias: number;
  precio_total: number;
  precio_por_dia: number;
  estado: string;
  valorado?: boolean;
}

const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaACancelar, setReservaACancelar] = useState<{id: number, nombre: string, politica: number, precioTotal: number} | null>(null);
  
  // Estados para el modal de calificación
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [reservaACalificar, setReservaACalificar] = useState<{id: number, codigo: string, nombre: string} | null>(null);
  const [calificacionPuntaje, setCalificacionPuntaje] = useState(0);
  const [calificacionComentario, setCalificacionComentario] = useState('');
  const [calificacionError, setCalificacionError] = useState<string | null>(null);
  const [showCalificacionSuccess, setShowCalificacionSuccess] = useState(false);
  
  const navigate = useNavigate();
  const rol = sessionStorage.getItem('usuarioRol');

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const usuarioId = sessionStorage.getItem('usuarioId');
      if (!usuarioId) {
        setError('Debes iniciar sesión para ver tus reservas');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/mis-reservas/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setReservas(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar las reservas');
      }
    } catch (err) {
      setError('Error de conexión al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const handleVerDetalle = (codigo: string) => {
    navigate(`/detalle-maquinaria/${codigo}`);
  };

  const formatearFecha = (fecha: string) => {
    // Parsear la fecha como YYYY-MM-DD para evitar problemas de zona horaria
    const [year, month, day] = fecha.split('-');
    const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return fechaLocal.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const puedeCancelarReserva = (fechaInicio: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    // Parsear la fecha como YYYY-MM-DD para evitar problemas de zona horaria
    const [year, month, day] = fechaInicio.split('-');
    const fechaRetiro = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    fechaRetiro.setHours(0, 0, 0, 0);
    
    const diferenciaMilisegundos = fechaRetiro.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    return diferenciaDias > 1;
  };

  const abrirModalCancelacion = async (reservaId: number) => {
    try {
      const reserva = reservas.find(r => r.id === reservaId);
      if (!reserva) {
        setError('Reserva no encontrada');
        return;
      }

      const response = await fetch(`http://localhost:5000/info-cancelacion/${reservaId}`);
      if (response.ok) {
        const data = await response.json();
        setReservaACancelar({
          id: reservaId,
          nombre: data.maquinaria_nombre,
          politica: data.politica_reembolso,
          precioTotal: reserva.precio_total
        });
        setShowCancelModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener información de cancelación');
      }
    } catch (err) {
      setError('Error de conexión al obtener información de cancelación');
    }
  };

  const cancelarReserva = async () => {
    if (!reservaACancelar) return;

    try {
      const response = await fetch(`http://localhost:5000/cancelar-reserva/${reservaACancelar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Recargar las reservas después de cancelar
        cargarReservas();
        setShowCancelModal(false);
        setReservaACancelar(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cancelar la reserva');
        setShowCancelModal(false);
        setReservaACancelar(null);
      }
    } catch (err) {
      setError('Error de conexión al cancelar la reserva');
      setShowCancelModal(false);
      setReservaACancelar(null);
    }
  };

  const abrirModalCalificacion = (reserva: Reserva) => {
    setReservaACalificar({
      id: reserva.id,
      codigo: reserva.maquinaria_codigo,
      nombre: reserva.maquinaria_nombre
    });
    setCalificacionPuntaje(0);
    setCalificacionComentario('');
    setCalificacionError(null);
    setShowCalificacionModal(true);
  };

  const enviarCalificacion = async () => {
    if (!reservaACalificar) return;

    try {
      setCalificacionError(null);
      
      const usuarioId = sessionStorage.getItem('usuarioId');
      if (!usuarioId) {
        setCalificacionError('Debes iniciar sesión para calificar');
        return;
      }
      
      // Enviar la calificación
      const response = await fetch(`http://localhost:5000/calificar-maquinaria/${reservaACalificar.codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puntaje: calificacionPuntaje,
          comentario: calificacionComentario,
          usuario_id: parseInt(usuarioId),
          reserva_id: reservaACalificar.id
        }),
      });

      if (response.ok) {
        // Marcar la reserva como valorada
        const marcarResponse = await fetch(`http://localhost:5000/marcar-valorado/${reservaACalificar.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (marcarResponse.ok) {
          // Recargar las reservas para actualizar el estado
          cargarReservas();
          setShowCalificacionModal(false);
          setReservaACalificar(null);
          setCalificacionPuntaje(0);
          setCalificacionComentario('');
          // Mostrar mensaje de éxito
          setShowCalificacionSuccess(true);
          setTimeout(() => setShowCalificacionSuccess(false), 3000);
        } else {
          setCalificacionError('Error al marcar la reserva como valorada');
        }
      } else {
        const errorData = await response.json();
        setCalificacionError(errorData.message || 'Error al enviar la calificación');
      }
    } catch (err) {
      setCalificacionError('Error de conexión al enviar la calificación');
    }
  };


  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div className="container py-5" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">Mis reservas y alquileres</h2>
              <p className="text-muted">Historial de todas tus reservas y alquileres</p>
            </div>
            
            {reservas.length === 0 ? (
              <div className="text-center py-5">
                <div className="card border-0 shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <div className="card-body py-5">
                    <div className="mb-3">
                      <i className="fas fa-calendar-times fa-3x text-muted"></i>
                    </div>
                    <h4 className="text-muted mb-3">No tienes reservas aún</h4>
                    <p className="text-muted">Cuando hagas una reserva, aparecerá aquí</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-1">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="col-12 col-md-6 col-lg-4 col-xl-3 mb-2">
                    <div
                      className="card h-100 shadow-sm border-0"
                      style={{
                        borderRadius: '12px',
                        maxWidth: 320,
                        margin: '0 auto'
                      }}
                    >
                      <div className="position-relative">
                        <img
                          src={`http://localhost:5000/uploads/maquinarias_fotos/${reserva.maquinaria_foto}`}
                          className="card-img-top"
                          alt={reserva.maquinaria_nombre}
                          style={{ 
                            height: '160px', 
                            objectFit: 'cover',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-maquinaria.svg';
                          }}
                        />
                        <span 
                          className={`position-absolute top-0 end-0 m-3 badge ${
                            reserva.estado === 'Activa' ? 'bg-success' : 
                            reserva.estado === 'esperando_retiro' ? 'bg-primary' :
                            reserva.estado === 'esperando_devolucion' ? 'bg-warning' :
                            reserva.estado === 'terminada' ? 'bg-secondary' :
                            reserva.estado === 'cancelada' ? 'bg-danger' : 'bg-secondary'
                          }`}
                          style={{ fontSize: '0.8rem' }}
                        >
                          {reserva.estado}
                        </span>
                      </div>
                      
                      <div className="card-body p-3">
                        <h5 className="card-title fw-bold mb-2" style={{ fontSize: '1.05rem' }}>{reserva.maquinaria_nombre}</h5>
                        <p className="card-text text-muted mb-2">
                          <small>Código: {reserva.maquinaria_codigo}</small>
                        </p>
                        
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Desde</small>
                            <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{formatearFecha(reserva.fecha_inicio)}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Hasta</small>
                            <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{formatearFecha(reserva.fecha_fin)}</div>
                          </div>
                        </div>
                        
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Duración</small>
                            <div className="fw-bold">{reserva.duracion_dias} día{reserva.duracion_dias !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Precio por día</small>
                            <div className="fw-bold">${reserva.precio_por_dia.toLocaleString('es-AR')}</div>
                          </div>
                        </div>
                        
                        <div className="border-top pt-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted d-block">Total</small>
                              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                                ${reserva.precio_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="d-flex gap-1 flex-wrap justify-content-end">
                              {puedeCancelarReserva(reserva.fecha_inicio) && 
                               (reserva.estado === 'esperando_retiro' || reserva.estado === 'Activa') && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  onClick={() => abrirModalCancelacion(reserva.id)}
                                >
                                  Cancelar
                                </button>
                              )}
                              {!reserva.valorado && reserva.estado === 'terminada' && (rol === 'cliente' || rol === 'empleado') && (
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  onClick={() => abrirModalCalificacion(reserva)}
                                >
                                  Valorar
                                </button>
                              )}
                              <button
                                className="btn btn-outline-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => handleVerDetalle(reserva.maquinaria_codigo)}
                              >
                                Ver Detalle
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Modal de confirmación de cancelación */}
      {showCancelModal && reservaACancelar && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-warning">Confirmar Cancelación</h5>
              </div>
              <div className="modal-body">
                <p className="mb-3">¿Estás seguro de que deseas cancelar esta reserva?</p>
                <div className="alert alert-info">
                  <strong>Política de reembolso:</strong><br />
                  El porcentaje de reembolso de <strong>{reservaACancelar.nombre}</strong> es del <strong>{reservaACancelar.politica}%</strong>
                  <br /><br />
                  <strong>Monto a reembolsar:</strong><br />
                  ${((reservaACancelar.precioTotal * reservaACancelar.politica) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })} de ${reservaACancelar.precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCancelModal(false);
                    setReservaACancelar(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={cancelarReserva}
                >
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast de éxito al calificar */}
      {showCalificacionSuccess && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <strong className="me-auto">¡Éxito!</strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowCalificacionSuccess(false)}
              ></button>
            </div>
            <div className="toast-body">
              ¡Gracias por tu calificación! Se ha guardado correctamente.
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de calificación */}
      <CalificacionModal
        show={showCalificacionModal}
        onClose={() => {
          setShowCalificacionModal(false);
          setCalificacionError(null);
          setReservaACalificar(null);
        }}
        onSubmit={enviarCalificacion}
        puntaje={calificacionPuntaje}
        setPuntaje={setCalificacionPuntaje}
        comentario={calificacionComentario}
        setComentario={setCalificacionComentario}
        error={calificacionError}
      />
      
      <Footer />
    </div>
  );
};

export default MisReservas;