import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PagoExitoso: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [codigoMaquinaria, setCodigoMaquinaria] = useState<string | null>(null);

  useEffect(() => {
    // Siempre intento guardar la reserva al entrar, y solo limpio después
    const usuarioEmail = localStorage.getItem('usuarioEmail');
    const codigoMaquinariaLS = localStorage.getItem('codigoMaquinaria');
    const fechaInicio = localStorage.getItem('fechaInicio');
    const fechaFin = localStorage.getItem('fechaFin');
    const montoTotal = localStorage.getItem('montoTotal');
    setCodigoMaquinaria(codigoMaquinariaLS);
    if (codigoMaquinariaLS) {
      sessionStorage.setItem('codigoMaquinaria', codigoMaquinariaLS);
    }
    if (usuarioEmail && codigoMaquinariaLS && fechaInicio && fechaFin && montoTotal) {
      fetch('http://localhost:5000/guardar-reserva-directa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_email: usuarioEmail,
          codigo_maquinaria: codigoMaquinariaLS,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          precio: montoTotal
        })
      })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'No se pudo guardar la reserva');
        }
        // Limpio los datos temporales solo después del intento
        localStorage.removeItem('codigoMaquinaria');
        localStorage.removeItem('fechaInicio');
        localStorage.removeItem('fechaFin');
        localStorage.removeItem('montoTotal');
      })
      .catch(() => {
        setError('No se pudo guardar la reserva');
      });
    } else {
      // Si no hay datos para guardar la reserva, redirijo automáticamente al inicio
      navigate('/');
    }
  }, [navigate]);

  const handleClose = () => {
    setShowModal(false);
    // Intento redirigir usando sessionStorage si localStorage ya fue limpiado
    const codigo = codigoMaquinaria || sessionStorage.getItem('codigoMaquinaria');
    if (codigo) {
      sessionStorage.removeItem('codigoMaquinaria');
      navigate(`/detalle-maquinaria/${codigo}`);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¡Gracias por tu alquiler!</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
              </div>
              <div className="modal-body text-center">
                <div className="alert alert-success p-3 shadow-sm mb-3">
                  <p className="lead mb-0">Tu pago fue procesado correctamente.</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PagoExitoso;
