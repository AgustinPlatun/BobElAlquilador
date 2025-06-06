import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  editNombre: string;
  setEditNombre: (v: string) => void;
  editDescripcion: string;
  setEditDescripcion: (v: string) => void;
  editPrecio: number;
  setEditPrecio: (v: number) => void;
  editFoto: (f: File | null) => void;
  editPoliticas: string;
  setEditPoliticas: (v: string) => void;
  editCategoriaId: string;
  setEditCategoriaId: (v: string) => void;
  categorias: { id: number; nombre: string }[];
  editError: string;
  setEditError: (v: string) => void;
  maquinaria: any;
  navigate: any;
  setShowEditModal: (v: boolean) => void;
}

const EditMaquinariaModal: React.FC<Props> = ({
  show, onClose,
  editNombre, setEditNombre,
  editDescripcion, setEditDescripcion,
  editPrecio, setEditPrecio,
  editFoto,
  editPoliticas, setEditPoliticas,
  editCategoriaId, setEditCategoriaId,
  categorias,
  editError, setEditError,
  maquinaria,
  navigate,
  setShowEditModal
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Maquinaria</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditError('');
                if (!editNombre || !editDescripcion || !editPrecio || !editCategoriaId || !editPoliticas) {
                  setEditError('Todos los campos son obligatorios.');
                  return;
                }
                const formData = new FormData();
                formData.append('nombre', editNombre);
                formData.append('descripcion', editDescripcion);
                formData.append('precio', String(editPrecio));
                // @ts-ignore
                if (e.target.foto.files[0]) formData.append('foto', e.target.foto.files[0]);
                formData.append('categoria_id', editCategoriaId);
                formData.append('politicas_reembolso', editPoliticas);

                const response = await fetch(`http://localhost:5000/editar-maquinaria/${maquinaria.codigo}`, {
                  method: 'PUT',
                  body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                  setShowEditModal(false);
                  if (data.maquinaria && data.maquinaria.codigo !== maquinaria.codigo) {
                    navigate(`/detalle-maquinaria/${encodeURIComponent(data.maquinaria.codigo)}`);
                    window.location.reload();
                  } else {
                    window.location.reload();
                  }
                } else {
                  setEditError(data.message || 'Hubo un problema al editar la maquinaria.');
                }
              }}
            >
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Precio</label>
                <input type="number" className="form-control" value={editPrecio} onChange={e => setEditPrecio(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Foto (opcional)</label>
                <input type="file" name="foto" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={editCategoriaId}
                  onChange={e => setEditCategoriaId(e.target.value)}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Políticas de reembolso</label>
                <input
                  className="form-control"
                  value={editPoliticas}
                  onChange={e => setEditPoliticas(e.target.value)}
                  placeholder="Ej: Reembolso solo por fallas técnicas"
                />
              </div>
              {editError && <div className="alert alert-danger">{editError}</div>}
              <button type="submit" className="btn btn-warning">Guardar Cambios</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMaquinariaModal;