import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  pregunta: string;
  setPregunta: (pregunta: string) => void;
  respuesta?: string;
  setRespuesta?: (respuesta: string) => void;
  esEmpleado?: boolean;
}

const PreguntaModal: React.FC<Props> = ({
  show,
  onClose,
  onSubmit,
  pregunta,
  setPregunta,
  respuesta,
  setRespuesta,
  esEmpleado = false
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {esEmpleado ? 'Responder Pregunta' : 'Hacer una Pregunta'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {!esEmpleado ? (
              <div className="mb-3">
                <label className="form-label">Tu pregunta</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  placeholder="Escribe tu pregunta sobre la maquinaria..."
                />
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Pregunta del cliente</label>
                  <div className="form-control-plaintext bg-light p-3 rounded">
                    {pregunta}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tu respuesta</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={respuesta || ''}
                    onChange={(e) => setRespuesta && setRespuesta(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                  />
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={!esEmpleado ? !pregunta.trim() : !respuesta?.trim()}
            >
              {esEmpleado ? 'Enviar Respuesta' : 'Enviar Pregunta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreguntaModal; 