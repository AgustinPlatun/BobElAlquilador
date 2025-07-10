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
}

interface Props {
  onVistaChange: (vista: 'inicio' | 'fin') => void;
}

const RetiroMaquinaria: React.FC<Props> = ({ onVistaChange }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/reservas-esperando-retiro');
      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha de inicio ascendente (más antigua primero)
        const reservasOrdenadas = data.sort((a: Reserva, b: Reserva) => {
          return new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime();
        });
        setReservas(reservasOrdenadas);
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

  const esFechaValidaParaRetiro = (fechaInicio: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    const [year, month, day] = fechaInicio.split('-');
    const fechaInicioReserva = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    fechaInicioReserva.setHours(0, 0, 0, 0);
    
    // La fecha de inicio debe ser hoy o posterior
    return fechaInicioReserva >= hoy;
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

  const confirmarRetiro = async () => {
    if (!reservaSeleccionada) return;
    
    try {
      const response = await fetch(`http://localhost:5000/confirmar-retiro/${reservaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        cargarReservas();
        setShowModal(false);
        setReservaSeleccionada(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al confirmar el retiro');
      }
    } catch (err) {
      setError('Error de conexión al confirmar el retiro');
    }
  };

  const handleConfirmarRetiro = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setReservaSeleccionada(null);
  };

  // Nueva función: ¿está habilitado el retiro hoy?
  const puedeRetirarHoy = (fechaInicio: string, fechaFin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y1, m1, d1] = fechaInicio.split('-');
    const [y2, m2, d2] = fechaFin.split('-');
    const inicio = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1));
    const fin = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2));
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    return hoy >= inicio && hoy <= fin;
  };
  // Nueva función: ¿está retrasada?
  const estaRetrasada = (fechaInicio: string, estado: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y1, m1, d1] = fechaInicio.split('-');
    const inicio = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1));
    inicio.setHours(0, 0, 0, 0);
    return hoy > inicio && estado === 'esperando_retiro';
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
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-3">Gestión de reservas y alquileres</h2>
        <div className="btn-group mb-3">
          <button
            className="btn btn-primary"
            onClick={() => onVistaChange('inicio')}
          >
            Retiro de maquinaria
          </button>
          <button
            className="btn btn-outline-primary"
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
            Esperando Retiro ({reservas.length})
          </h5>
        </div>
        <div className="card-body">
          {reservas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                No hay retiros de maquinarias pendientes.
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
                  {reservas.map((reserva) => (
                    <tr key={reserva.id} className={estaRetrasada(reserva.fecha_inicio, reserva.estado) ? 'table-danger' : ''}>
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
                        <span className={`badge ${obtenerColorEstado(reserva.estado)} text-white`}>
                          {reserva.estado}
                        </span>
                        {estaRetrasada(reserva.fecha_inicio, reserva.estado) && (
                          <span className="ms-2 badge bg-danger">Cuenta con retraso</span>
                        )}
                      </td>
                      <td>
                        {reserva.estado === 'esperando_retiro' && puedeRetirarHoy(reserva.fecha_inicio, reserva.fecha_fin) && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleConfirmarRetiro(reserva)}
                          >
                            Confirmar Retiro
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-overlay" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1050 
          }} onClick={cerrarModal}></div>
          <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 1051 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Retiro de Maquinaria</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                {reservaSeleccionada && (
                  <div>
                    <p>¿Está seguro que desea confirmar el retiro de la siguiente reserva?</p>
                    {estaRetrasada(reservaSeleccionada.fecha_inicio, reservaSeleccionada.estado) && (
                      <div className="alert alert-danger mb-2">
                        <strong>¡Atención!</strong> Esta reserva cuenta con retraso en el retiro.
                      </div>
                    )}
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Detalles de la Reserva</h6>
                        <p><strong>Cliente:</strong></p>
                        <div className="ms-3">
                          <div>{reservaSeleccionada.cliente_email}</div>
                          <small className="text-muted">{reservaSeleccionada.cliente_nombre} {reservaSeleccionada.cliente_apellido}</small>
                        </div>
                        <p><strong>Maquinaria:</strong> {reservaSeleccionada.maquinaria_nombre}</p>
                        <p><strong>Categoría:</strong> {reservaSeleccionada.categoria_nombre}</p>
                        <p><strong>Fecha Inicio:</strong> {formatearFecha(reservaSeleccionada.fecha_inicio)}</p>
                        <p><strong>Fecha Fin:</strong> {formatearFecha(reservaSeleccionada.fecha_fin)}</p>
                        <p><strong>Monto Total:</strong> {formatearMonto(reservaSeleccionada.monto_total)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={confirmarRetiro}>
                  Confirmar Retiro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RetiroMaquinaria;
