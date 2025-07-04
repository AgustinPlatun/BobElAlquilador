import React, { useState, useEffect } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

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

const ReservasHoy: React.FC = () => {
  const [reservasInicio, setReservasInicio] = useState<Reserva[]>([]);
  const [reservasFin, setReservasFin] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState<'inicio' | 'fin' | null>(null);

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  useEffect(() => {
    if (vista) cargarReservas();
  }, [vista]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = vista === 'inicio' 
        ? 'http://localhost:5000/reservas-inicio-hoy'
        : 'http://localhost:5000/reservas-fin-hoy';
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        vista === 'inicio' ? setReservasInicio(data) : setReservasFin(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Error al cargar las reservas que ${vista === 'inicio' ? 'inician' : 'finalizan'} hoy`);
      }
    } catch (err) {
      setError('Error de conexión al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleVistaChange = (nuevaVista: 'inicio' | 'fin') => {
    if (vista === nuevaVista) return;
    
    setVista(nuevaVista);
    setReservasInicio([]);
    setReservasFin([]);
    setError('');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR');
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
      default:
        return 'bg-secondary';
    }
  };

  const renderContent = () => {
    if (!vista) {
      return (
        <div className="text-center">
          <h2 className="fw-bold mb-3">Reservas de Hoy</h2>
          <p className="text-muted mb-4">Selecciona el tipo de reservas que deseas ver para la fecha: {fechaHoy}</p>
          <div className="btn-group">
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('inicio')}>
              Reservas que Inician Hoy
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('fin')}>
              Reservas que Finalizan Hoy
            </button>
          </div>
        </div>
      );
    }

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

    if (error) {
      return <div className="alert alert-danger text-center">{error}</div>;
    }

    const reservasActuales = vista === 'inicio' ? reservasInicio : reservasFin;
    const hayDatos = reservasActuales.length > 0;

    return (
      <>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3">Reservas de Hoy</h2>
          <div className="btn-group mb-3">
            {['inicio', 'fin'].map(tipo => (
              <button
                key={tipo}
                className={`btn ${vista === tipo ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleVistaChange(tipo as 'inicio' | 'fin')}
              >
                Reservas que {tipo === 'inicio' ? 'Inician' : 'Finalizan'} Hoy
              </button>
            ))}
          </div>
          <p className="text-muted">Fecha actual: {fechaHoy}</p>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              Reservas que {vista === 'inicio' ? 'Inician' : 'Finalizan'} Hoy ({reservasActuales.length})
            </h5>
          </div>
          <div className="card-body">
            {!hayDatos ? (
              <div className="text-center py-4">
                <p className="text-muted mb-0">
                  No hay reservas que {vista === 'inicio' ? 'inicien' : 'finalicen'} hoy
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
                    </tr>
                  </thead>
                  <tbody>
                    {reservasActuales.map((reserva) => (
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

  return (
    <div>
      <Navbar />
      <div style={{ paddingLeft: 16, paddingRight: 16 }}>
        <div className="container py-5">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReservasHoy;
