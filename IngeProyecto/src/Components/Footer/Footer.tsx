import React, { useState } from 'react';

interface TicketSoporte {
  contacto: string;
  asunto: string;
  descripcion: string;
}

const Footer: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error' | ''>('');
  const [formData, setFormData] = useState<TicketSoporte>({
    contacto: '',
    asunto: '',
    descripcion: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contacto || !formData.asunto || !formData.descripcion) {
      setMensaje('Todos los campos son obligatorios');
      setTipoMensaje('error');
      return;
    }

    setLoading(true);
    setMensaje('');

    try {
      const response = await fetch('http://localhost:5000/crear-ticket-soporte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensaje('Ticket de soporte creado exitosamente. Nos pondremos en contacto contigo en caso de ser necesario.');
        setTipoMensaje('success');
        setFormData({ contacto: '', asunto: '', descripcion: '' });
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          setShowModal(false);
          setMensaje('');
          setTipoMensaje('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setMensaje(errorData.message || 'Error al crear el ticket de soporte');
        setTipoMensaje('error');
      }
    } catch (error) {
      setMensaje('Error de conexión. Por favor, intenta de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ contacto: '', asunto: '', descripcion: '' });
    setMensaje('');
    setTipoMensaje('');
  };

  return (
    <>
      <footer className="bg-dark text-white py-2 mt-4">
        <div className="container">
          <div className="row align-items-center position-relative">
            <div className="col-md-4 d-flex justify-content-start">
              <button
                className="btn btn-outline-light btn-sm ms-3"
                onClick={() => setShowModal(true)}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.4rem 0.8rem',
                  zIndex: 1000,
                  position: 'relative'
                }}
              >
                <i className="fas fa-headset me-1" style={{ fontSize: '0.7rem' }}></i>
                Soporte
              </button>
            </div>
            <div className="col-12 position-absolute text-center" style={{ pointerEvents: 'none', left: 0, right: 0 }}>
              <p className="mb-0" style={{ fontSize: '0.75rem' }}>
                © 2025 Bob el Alquilador. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Soporte Técnico */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-headset me-2"></i>
                  Contactar Soporte Técnico
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {mensaje && (
                  <div className={`alert ${tipoMensaje === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {mensaje}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="contacto" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Contacto (Email o Teléfono) *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="contacto"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleInputChange}
                      placeholder="ejemplo@email.com o +54 9 11 1234-5678"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="asunto" className="form-label">
                      <i className="fas fa-tag me-2"></i>
                      Asunto *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente el problema"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">
                      <i className="fas fa-comment me-2"></i>
                      Descripción del Problema *
                    </label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      rows={5}
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe detalladamente el problema que estás experimentando..."
                      disabled={loading}
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Enviar Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
