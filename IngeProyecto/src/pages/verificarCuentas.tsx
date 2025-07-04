import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import Navbar from "../Components/NavBar/Navbar";
import Footer from "../Components/Footer/Footer";
import { Modal, Button } from "react-bootstrap";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  dni_foto?: string;
  fecha_nacimiento: string;
}

type AccionPendiente = "activar" | "eliminar" | null;

const UsuariosPendientes: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [accion, setAccion] = useState<AccionPendiente>(null);
  const [showModal, setShowModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/usuarios-pendientes");
      setUsuarios(response.data);
    } catch (err) {
      setError("Error al cargar los usuarios pendientes");
    }
  };

  const confirmarAccion = (usuario: Usuario, tipo: AccionPendiente) => {
    setUsuarioSeleccionado(usuario);
    setAccion(tipo);
    setShowModal(true);
  };

  const ejecutarAccion = async () => {
    if (!usuarioSeleccionado || !accion) return;
    setLoading(true);
    try {
      if (accion === "activar") {
        await axios.put(`http://localhost:5000/activar-usuario/${usuarioSeleccionado.id}`);
      } else if (accion === "eliminar") {
        await axios.post(`http://localhost:5000/rechazar-usuario/${usuarioSeleccionado.id}`, {
          motivo: motivoRechazo,
        });
      }
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioSeleccionado.id));
      cerrarModal();
      setUsuarioSeleccionado(null);
      setAccion(null);
    } catch (err) {
      setError("No se pudo procesar la acción.");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setMotivoRechazo('');
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div className="container mt-5">
          <h2 className="text-danger text-center mb-4">Usuarios Pendientes</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="list-group">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="list-group-item mb-2 mx-auto w-100" style={{     
                border: "1px solid red",
                borderRadius: "8px",
                maxWidth: "800px",
                margin: "0 auto",
              }}>
              <div className="row">
                <div className="col-12 col-md-8">
                  <strong className="d-block">
                    {usuario.nombre} {usuario.apellido}
                  </strong>
                  <small className="d-block">{usuario.email}</small>
                  <small className="text-muted">
                    Fecha de nacimiento: {usuario.fecha_nacimiento}
                  </small>
                </div>
                <div className="col-12 col-md-4 mt-3 mt-md-0 d-flex flex-md-row justify-content-md-end align-items-start align-items-md-center gap-2">
                  {usuario.dni_foto && (
                    <a
                      className="btn btn-primary text-nowrap"
                      style={{ minWidth: "100px"}}
                      href={`http://localhost:5000/uploads/dni_clientes_fotos/${usuario.dni_foto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver DNI
                    </a>
                  )}
                  <button
                    className="btn btn-success"
                    onClick={() => confirmarAccion(usuario, "activar")}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => confirmarAccion(usuario, "eliminar")}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {usuarios.length === 0 && (
            <p className="text-center">No hay usuarios pendientes.</p>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {accion === "activar" ? "Confirmar Activación" : "Confirmar Rechazo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {accion === "eliminar" ? (
            <>
              <p>
                ¿Estás seguro que querés rechazar al usuario <strong>{usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}</strong>?
              </p>
              <textarea
                className="form-control"
                placeholder="Motivo del rechazo"
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                rows={3}
              />
            </>
          ) : (
            <p>
              ¿Estás seguro que querés activar al usuario <strong>{usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button
            variant={accion === "activar" ? "success" : "danger"}
            onClick={ejecutarAccion}
            disabled={loading || (accion === "eliminar" && !motivoRechazo)}
          >
            {accion === "activar" ? "Activar Usuario" : "Rechazar Usuario"}
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default UsuariosPendientes;
