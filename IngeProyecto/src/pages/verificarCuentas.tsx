import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import Navbar from "../Components/NavBar/Navbar";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  dni_foto?: string;
  fecha_nacimiento: string;
}

const UsuariosPendientes: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState("");

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

  const activarUsuario = async (id: number) => {
    try {
      await axios.put(`http://localhost:5000/activar-usuario/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error al activar el usuario", err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-danger text-center mb-4">Usuarios Pendientes</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="list-group">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="list-group-item mb-2"
            >
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
                      style={{ minWidth: "100px" }}
                      href={`http://localhost:5000/uploads/dni_clientes_fotos/${usuario.dni_foto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver DNI
                    </a>
                  )}
                  <button
                    className="btn btn-success"
                    onClick={() => activarUsuario(usuario.id)}
                  >
                    <FaCheck />
                  </button>
                  <button className="btn btn-danger">
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
    </div>
  );
};

export default UsuariosPendientes;
