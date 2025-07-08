import React, { useState, useEffect } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

interface TicketSoporte {
  id: number;
  contacto: string;
  asunto: string;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
}

const GestionSoporte: React.FC = () => {
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToUpdate, setTicketToUpdate] = useState<{ id: number; estado: string } | null>(null);

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/tickets-soporte');
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        setError('Error al cargar los tickets de soporte');
      }
    } catch (err) {
      setError('Error de conexión al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (ticketId: number, nuevoEstado: string) => {
    try {
      const response = await fetch(`http://localhost:5000/actualizar-ticket-soporte/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        // Si el ticket ya no está pendiente, quitarlo de la lista
        if (nuevoEstado !== 'Pendiente') {
          setTickets(prevTickets =>
            prevTickets.filter(ticket => ticket.id !== ticketId)
          );
        } else {
          // Actualizar el ticket en el estado local
          setTickets(prevTickets =>
            prevTickets.map(ticket =>
              ticket.id === ticketId
                ? { ...ticket, estado: nuevoEstado }
                : ticket
            )
          );
        }
      } else {
        alert('Error al actualizar el estado del ticket');
      }
    } catch (err) {
      alert('Error de conexión al actualizar el ticket');
    }
  };

  const handleConfirmAction = (ticketId: number, nuevoEstado: string) => {
    setTicketToUpdate({ id: ticketId, estado: nuevoEstado });
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    if (ticketToUpdate) {
      await actualizarEstado(ticketToUpdate.id, ticketToUpdate.estado);
      setShowConfirmModal(false);
      setTicketToUpdate(null);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
    setTicketToUpdate(null);
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'en proceso':
        return 'bg-info text-white';
      case 'resuelto':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  if (loading) {
    return (
      <div className="full-page-layout">
        <Navbar />
        <div className="main-content-centered">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 small">Cargando tickets de soporte...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-page-layout">
        <Navbar />
        <div className="main-content-centered">
          <div className="alert alert-danger text-center small">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div className="container py-3">
          <div className="text-center mb-3">
            <h4 className="fw-bold mb-2">Gestión de Soporte Técnico</h4>
            <p className="text-muted small">Tickets de soporte pendientes</p>
          </div>

          <div className="mx-3">
            {/* Lista de tickets */}
            {tickets.length === 0 ? (
              <div className="text-center py-3">
                <div className="card border-0 shadow-sm" style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <div className="card-body py-3">
                    <div className="mb-2">
                      <i className="fas fa-ticket-alt fa-2x text-muted"></i>
                    </div>
                    <h6 className="text-muted mb-2">No hay tickets pendientes</h6>
                    <p className="text-muted small mb-0">
                      Cuando lleguen tickets de soporte, aparecerán aquí
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="card shadow-sm border-0" style={{ borderRadius: '6px' }}>
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted fw-bold small">#{ticket.id}</span>
                          <h6 className="card-title fw-bold mb-0 small">{ticket.asunto}</h6>
                        </div>
                        <span className={`badge ${obtenerColorEstado(ticket.estado)} small`}>
                          {ticket.estado}
                        </span>
                      </div>
                      
                      <hr className="my-2" style={{ borderColor: '#dee2e6', opacity: 0.5 }} />
                      
                      <div className="row">
                        <div className="col-md-3">
                          <small className="text-muted d-block">Contacto:</small>
                          <div className="fw-bold small">{ticket.contacto}</div>
                        </div>
                        
                        <div className="col-md-6">
                          <small className="text-muted d-block">Descripción:</small>
                          <p className="mb-0 small">
                            {ticket.descripcion.length > 150 
                              ? `${ticket.descripcion.substring(0, 150)}...` 
                              : ticket.descripcion
                            }
                          </p>
                        </div>
                        
                        <div className="col-md-3">
                          <small className="text-muted d-block">Fecha:</small>
                          <div className="mb-2 small">{formatearFecha(ticket.fecha_creacion)}</div>
                          
                          <div className="d-flex gap-1">
                            {ticket.estado === 'Pendiente' && (
                              <button
                                className="btn btn-success btn-sm small"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => handleConfirmAction(ticket.id, 'En proceso')}
                              >
                                Hecho
                              </button>
                            )}
                            
                            {ticket.estado === 'En proceso' && (
                              <button
                                className="btn btn-success btn-sm small"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => actualizarEstado(ticket.id, 'Resuelto')}
                              >
                                Resolver
                              </button>
                            )}
                            
                            {ticket.estado === 'Resuelto' && (
                              <button
                                className="btn btn-outline-secondary btn-sm small"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                disabled
                              >
                                Completado
                              </button>
                            )}
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
      
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar acción</h5>
                <button type="button" className="btn-close" onClick={cancelUpdate}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres marcar este ticket como "Solucionado"?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelUpdate}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={confirmUpdate}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default GestionSoporte;
