import React from 'react';
import StarRating from '../../Components/StarRating';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  puntaje: number;
  setPuntaje: (puntaje: number) => void;
  comentario: string;
  setComentario: (comentario: string) => void;
  error?: string | null;
}

const CalificacionModal: React.FC<Props> = ({
  show,
  onClose,
  onSubmit,
  puntaje,
  setPuntaje,
  comentario,
  setComentario,
  error
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Calificar Maquinaria</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Puntaje</label>
              <StarRating
                rating={puntaje}
                size={30}
                onRatingChange={setPuntaje}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Comentario</label>
              <textarea
                className="form-control"
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu opinión sobre la maquinaria..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={puntaje === 0}
            >
              Enviar Calificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalificacionModal; 