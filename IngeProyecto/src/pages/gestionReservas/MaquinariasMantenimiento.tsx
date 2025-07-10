import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';

interface Maquinaria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  foto: string | null;
  estado: boolean;
  mantenimiento: boolean;
  categoria_id: number;
  precio: number;
}

const MaquinariasMantenimiento: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<Maquinaria | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaquinarias();
  }, []);

  const fetchMaquinarias = async () => {
    try {
      const res = await axios.get('http://localhost:5000/maquinarias-en-mantenimiento');
      setMaquinarias(res.data);
    } catch (e) {
      setMaquinarias([]);
    }
  };

  const handleOpenModal = (maquinaria: Maquinaria) => {
    setSelectedMaquinaria(maquinaria);
    setDescripcion('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMaquinaria(null);
    setDescripcion('');
  };

  const handleSacarDeMantenimiento = async () => {
    if (!selectedMaquinaria) return;
    setLoading(true);
    try {
      const empleado_id = sessionStorage.getItem('usuarioId');
      await axios.put(`http://localhost:5000/sacar-de-mantenimiento/${selectedMaquinaria.id}`, {
        descripcion,
        empleado_id
      });
      handleCloseModal();
      fetchMaquinarias();
    } catch (e) {
      alert('Error al sacar de mantenimiento');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="container py-5 flex-grow-1">
        <h2 className="fw-bold mb-4 text-danger text-center" style={{ letterSpacing: '-1px' }}>Maquinarias en mantenimiento</h2>
        {maquinarias.length === 0 ? (
          <div className="alert alert-info mt-4 text-center mx-auto" style={{maxWidth: 350}}>
            No hay maquinarias en mantenimiento.
          </div>
        ) : (
          <div className="row mt-4 justify-content-center">
            {maquinarias.map(m => (
              <div className="col-md-5 col-lg-3 mb-4" key={m.id}>
                <div className="card h-100 shadow-sm border-2 border-danger" style={{borderWidth:2}}>
                  {m.foto ? (
                    <div className="d-flex align-items-center justify-content-center" style={{height:140,background:'#fafbfc',borderTopLeftRadius:12,borderTopRightRadius:12}}>
                      <img
                        src={`http://localhost:5000/uploads/maquinarias_fotos/${m.foto}`}
                        alt={m.nombre}
                        style={{width:120,height:120,objectFit:'cover',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}
                      />
                    </div>
                  ) : (
                    <div style={{height:140,background:'#eee',borderTopLeftRadius:12,borderTopRightRadius:12}} className="d-flex align-items-center justify-content-center text-muted">
                      Sin imagen
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-success mb-1">{m.nombre}</h5>
                    <div className="text-danger fw-bold mb-2" style={{fontSize:'0.95rem'}}>Código: {m.codigo}</div>
                    <p className="card-text text-muted mb-2" style={{minHeight:40,fontSize:'0.95rem'}}>{m.descripcion}</p>
                    <div className="mt-auto">
                      <Button variant="danger" className="w-100 fw-bold" onClick={() => handleOpenModal(m)}>
                        Sacar de mantenimiento
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Sacar de mantenimiento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="descripcion">
                <Form.Label>Descripción del mantenimiento realizado</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSacarDeMantenimiento} disabled={loading || !descripcion}>
              {loading ? 'Guardando...' : 'Confirmar'}
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
      <Footer />
    </div>
  );
};

export default MaquinariasMantenimiento; 