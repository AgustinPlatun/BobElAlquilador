import React, { useState, useEffect } from 'react';

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  monto_total: number;
  estado: string;
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_email: string;
  maquinaria_nombre: string;
  maquinaria_codigo: string;
  maquinaria_marca: string;
  maquinaria_modelo: string;
  categoria_nombre: string;
  precio_maquinaria: number; // Added for calculating delay
}

interface Props {
  onVistaChange: (vista: 'inicio' | 'fin') => void;
}

const DevolucionMaquinaria: React.FC<Props> = ({ onVistaChange }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [procesandoDevolucion, setProcesandoDevolucion] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservaADevolver, setReservaADevolver] = useState<Reserva | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/reservas-esperando-devolucion');
      
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

  const abrirModalConfirmacion = (reserva: Reserva) => {
    setReservaADevolver(reserva);
    setShowConfirmModal(true);
  };

  const confirmarDevolucion = async () => {
    if (!reservaADevolver) return;

    try {
      setProcesandoDevolucion(reservaADevolver.id);
      setError('');
      
      const response = await fetch(`http://localhost:5000/confirmar-devolucion/${reservaADevolver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Recargar las reservas para actualizar la lista
        await cargarReservas();
        setShowConfirmModal(false);
        setReservaADevolver(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al confirmar la devolución');
      }
    } catch (err) {
      setError('Error de conexión al confirmar la devolución');
    } finally {
      setProcesandoDevolucion(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('-');
    const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return fechaLocal.toLocaleDateString('es-AR');
  };

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 2 
    });
  };

  const calcularDiasRetraso = (fechaFin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    const [year, month, day] = fechaFin.split('-');
    const fechaFinReserva = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    fechaFinReserva.setHours(0, 0, 0, 0);
    
    const diferenciaMilisegundos = hoy.getTime() - fechaFinReserva.getTime();
    const diasRetraso = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    console.log('Fecha hoy:', hoy);
    console.log('Fecha fin reserva:', fechaFinReserva);
    console.log('Días de retraso:', diasRetraso);
    
    return diasRetraso > 0 ? diasRetraso : 0;
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmada':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning';
      case 'cancelada':
        return 'bg-danger';
      case 'completada':
        return 'bg-info';
      case 'esperando_retiro':
        return 'bg-primary';
      case 'esperando_devolucion':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast de éxito */}
      {showSuccessToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <strong className="me-auto">Éxito</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowSuccessToast(false)}></button>
            </div>
            <div className="toast-body">
              Devolución confirmada exitosamente.
            </div>
          </div>
        </div>
      )}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-3">Gestión de Reservas</h2>
        <div className="btn-group mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => onVistaChange('inicio')}
          >
            Retiro de maquinaria
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onVistaChange('fin')}
          >
            Devolución de maquinaria
          </button>
        </div>
        <p className="text-muted">Fecha actual: {fechaHoy}</p>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            Reservas Esperando Devolución ({reservas.length})
          </h5>
        </div>
        <div className="card-body">
          {reservas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                No hay reservas esperando devolución
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Maquinaria</th>
                    <th>Categoría</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Monto Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((reserva) => {
                    const esDevolucionTardia = calcularDiasRetraso(reserva.fecha_fin) > 0;
                    return (
                      <tr 
                        key={reserva.id} 
                        className={esDevolucionTardia ? 'table-danger' : ''}
                        style={esDevolucionTardia ? { backgroundColor: '#f8d7da' } : {}}
                      >
                      <td>
                        <div>
                          <div className="fw-bold">{reserva.cliente_email}</div>
                          <small className="text-muted">
                            {reserva.cliente_nombre} {reserva.cliente_apellido}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{reserva.maquinaria_nombre}</div>
                          <div className="text-start">
                            <small className="text-muted">
                              ({reserva.maquinaria_codigo})
                            </small>
                          </div>
                          {(reserva.maquinaria_marca || reserva.maquinaria_modelo) && (
                            <div>
                              <small className="text-muted">
                                {reserva.maquinaria_marca} {reserva.maquinaria_modelo}
                              </small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {reserva.categoria_nombre}
                        </span>
                      </td>
                      <td>{formatearFecha(reserva.fecha_inicio)}</td>
                      <td>{formatearFecha(reserva.fecha_fin)}</td>
                      <td className="text-success fw-bold">
                        {formatearMonto(reserva.monto_total)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${obtenerColorEstado(reserva.estado)} text-white`}>
                            {reserva.estado}
                          </span>
                          {calcularDiasRetraso(reserva.fecha_fin) > 0 && (
                            <span className="text-warning" title="Devolución tardía">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => abrirModalConfirmacion(reserva)}
                          disabled={procesandoDevolucion === reserva.id}
                        >
                          {procesandoDevolucion === reserva.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            'Confirmar Devolución'
                          )}
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && reservaADevolver && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-success">Confirmar Devolución</h5>
              </div>
              <div className="modal-body">
                <p className="mb-3">¿Estás seguro de que deseas confirmar la devolución de esta maquinaria?</p>
                
                {/* Verificar si hay retraso */}
                {(() => {
                  const diasRetraso = calcularDiasRetraso(reservaADevolver.fecha_fin);
                  console.log('Días de retraso en modal:', diasRetraso);
                  
                  if (diasRetraso > 0) {
                    // El monto de retraso es diasRetraso x precio de la maquinaria (precioMaquinaria = precio_maquinaria de la reserva)
                    const precioMaquinaria = reservaADevolver.precio_maquinaria;
                    const montoRetraso = diasRetraso * precioMaquinaria;
                    return (
                      <div className="alert alert-danger">
                        <strong>⚠️ Devolución Tardía</strong><br />
                        El cliente está devolviendo la maquinaria con <strong>{diasRetraso} día{diasRetraso !== 1 ? 's' : ''} de retraso</strong>.<br />
                        <hr style={{ margin: '10px 0' }} />
                        <span className="fw-bold">Monto a cobrar por retraso:</span> {diasRetraso} × {formatearMonto(precioMaquinaria)} = <span className="text-danger fw-bold">{formatearMonto(montoRetraso)}</span><br />
                        <span className="text-muted" style={{ fontSize: '0.95em' }}>
                          (Se cobrará el precio de la maquinaria por cada día de retraso.)
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-6">
                        <strong>Cliente:</strong><br />
                        <div>{reservaADevolver.cliente_email}</div>
                        <small className="text-muted">
                          {reservaADevolver.cliente_nombre} {reservaADevolver.cliente_apellido}
                        </small>
                      </div>
                      <div className="col-6">
                        <strong>Maquinaria:</strong><br />
                        {reservaADevolver.maquinaria_nombre}
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-6">
                        <strong>Fecha fin:</strong><br />
                        <span className={calcularDiasRetraso(reservaADevolver.fecha_fin) > 0 ? 'text-danger fw-bold' : ''}>
                          {formatearFecha(reservaADevolver.fecha_fin)}
                        </span>
                      </div>
                      <div className="col-6">
                        <strong>Monto total:</strong><br />
                        <span className="text-success fw-bold">
                          {formatearMonto(reservaADevolver.monto_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setReservaADevolver(null);
                  }}
                  disabled={procesandoDevolucion === reservaADevolver.id}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-success"
                  onClick={confirmarDevolucion}
                  disabled={procesandoDevolucion === reservaADevolver.id}
                >
                  {procesandoDevolucion === reservaADevolver.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Devolución'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevolucionMaquinaria;
