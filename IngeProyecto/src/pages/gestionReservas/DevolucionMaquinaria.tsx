import React, { useState, useEffect } from 'react';

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  monto_total: number;
  estado: string;
  cliente_nombre: string;
  cliente_apellido: string;
  maquinaria_nombre: string;
  maquinaria_marca: string;
  maquinaria_modelo: string;
  categoria_nombre: string;
}

interface Props {
  onVistaChange: (vista: 'inicio' | 'fin') => void;
}

const DevolucionMaquinaria: React.FC<Props> = ({ onVistaChange }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [procesandoDevolucion, setProcesandoDevolucion] = useState<number | null>(null);

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

  const confirmarDevolucion = async (reservaId: number) => {
    try {
      setProcesandoDevolucion(reservaId);
      setError('');
      
      const response = await fetch(`http://localhost:5000/confirmar-devolucion/${reservaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Recargar las reservas para actualizar la lista
        await cargarReservas();
        alert('Devolución confirmada exitosamente');
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
                  {reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td className="fw-bold">
                        {reserva.cliente_nombre} {reserva.cliente_apellido}
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{reserva.maquinaria_nombre}</div>
                          {(reserva.maquinaria_marca || reserva.maquinaria_modelo) && (
                            <small className="text-muted">
                              {reserva.maquinaria_marca} {reserva.maquinaria_modelo}
                            </small>
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
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => confirmarDevolucion(reserva.id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DevolucionMaquinaria;
