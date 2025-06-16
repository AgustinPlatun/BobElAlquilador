import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  descripcion: string;
  setDescripcion: (descripcion: string) => void;
  historial?: Array<{
    id: number;
    descripcion: string;
    fecha: string;
    empleado_id: number;
    empleado_nombre: string;
  }>;
  modoAgregar?: boolean;
}

const MantenimientoModal: React.FC<Props> = ({
  show,
  onClose,
  onSubmit,
  descripcion,
  setDescripcion,
  historial = [],
  modoAgregar = false
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {modoAgregar ? 'Agregar Mantenimiento' : 'Historial de Mantenimiento'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Formulario para agregar nuevo mantenimiento */}
            {modoAgregar ? (
              <div className="mb-3">
                <label className="form-label">Descripción del mantenimiento</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el mantenimiento realizado..."
                />
              </div>
            ) : (
              /* Historial de mantenimientos */
              historial.length > 0 ? (
                <div 
                  className="list-group" 
                  style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6c757d #f8f9fa'
                  }}
                >
                  {historial.map((mant) => (
                    <div key={mant.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{mant.empleado_nombre}</strong>
                          <small className="text-muted ms-2">
                            {new Date(mant.fecha).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <p className="mt-2 mb-0">{mant.descripcion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No hay registros de mantenimiento.</p>
              )
            )}
          </div>
          <div className="modal-footer">
            {modoAgregar && (
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={onSubmit}
                disabled={!descripcion.trim()}
              >
                Agregar Mantenimiento
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MantenimientoModal; 