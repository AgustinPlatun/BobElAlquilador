import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';

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
}

const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarReservas = async () => {
      try {
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

    cargarReservas();
  }, []);

  const handleVerDetalle = (codigo: string) => {
    navigate(`/detalle-maquinaria/${codigo}`);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div>
      <Navbar />
      <div className="container py-5" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">Mis Reservas</h2>
              <p className="text-muted">Historial de todas tus reservas</p>
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
              <div className="row g-4">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                    <div
                      className="card h-100 shadow-sm border-0"
                      style={{
                        borderRadius: '12px',
                        maxWidth: 320, // <-- antes 270, ahora más ancho
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
                            reserva.estado === 'Activa' ? 'bg-success' : 'bg-secondary'
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
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleVerDetalle(reserva.maquinaria_codigo)}
                            >
                              Ver Detalle
                            </button>
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
  );
};

export default MisReservas;