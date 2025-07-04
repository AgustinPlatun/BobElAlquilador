import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/NavBar/Navbar";
import Footer from "../Components/Footer/Footer";

const PreguntasSinResponder: React.FC = () => {
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [respuesta, setRespuesta] = useState<{ [id: number]: string }>({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const usuarioId = sessionStorage.getItem("usuarioId");
  const usuarioRol = sessionStorage.getItem("usuarioRol");

  useEffect(() => {
    fetch("http://localhost:5000/preguntas-sin-responder")
      .then((res) => res.json())
      .then((data) => setPreguntas(data))
      .catch(() => setError("No se pudieron cargar las preguntas."));
  }, []);

  const handleRespuestaChange = (id: number, value: string) => {
    setRespuesta((prev) => ({ ...prev, [id]: value }));
  };

  const handleResponder = async (preguntaId: number) => {
    setMensaje("");
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/responder-pregunta/${preguntaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuesta: respuesta[preguntaId],
          empleado_id: usuarioId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Respuesta enviada correctamente.");
        setPreguntas(preguntas.filter((p) => p.id !== preguntaId));
        setRespuesta((prev) => {
          const nuevo = { ...prev };
          delete nuevo[preguntaId];
          return nuevo;
        });
      } else {
        setError(data.message || "No se pudo enviar la respuesta.");
      }
    } catch {
      setError("Error al enviar la respuesta.");
    }
  };

  if (usuarioRol !== "empleado" && usuarioRol !== "administrador") {
    return (
      <div className="full-page-layout">
        <Navbar />
        <div className="main-content-centered">
          <div className="alert alert-danger text-center">
            Solo los empleados pueden ver esta página.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div className="container py-2">
          <h2 className="mb-4 text-center">Preguntas sin responder</h2>
          {mensaje && <div className="alert alert-success">{mensaje}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {preguntas.length === 0 ? (
            <div className="text-center text-muted">No hay preguntas pendientes.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Maquinaria</th>
                    <th>Pregunta</th>
                    <th>Cliente</th>
                    <th>Respuesta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {preguntas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.fecha_pregunta}</td>
                      <td>
                        <Link to={`/detalle-maquinaria/${p.maquinaria_codigo}`}>
                          {p.maquinaria_nombre}
                        </Link>
                        <br />
                        <span className="text-secondary">({p.maquinaria_codigo})</span>
                      </td>
                      <td>{p.pregunta}</td>
                      <td>{p.usuario_nombre}</td>
                      <td>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={respuesta[p.id] || ""}
                          onChange={(e) => handleRespuestaChange(p.id, e.target.value)}
                          placeholder="Escriba su respuesta..."
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          disabled={!respuesta[p.id] || respuesta[p.id].trim() === ""}
                          onClick={() => handleResponder(p.id)}
                        >
                          Responder
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
      <Footer />
    </div>
  );
};

export default PreguntasSinResponder;