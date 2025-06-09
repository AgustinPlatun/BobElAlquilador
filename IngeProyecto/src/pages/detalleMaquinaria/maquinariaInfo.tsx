import React from 'react';

interface Props {
  maquinaria: {
    nombre: string;
    codigo: string;
    foto: string;
    categoria?: string;
  };
  openEditModal: () => void;
  rol: string | null;
}

const MaquinariaInfo: React.FC<Props> = ({ maquinaria }) => (
  <div className="col-md-7 d-flex align-items-center justify-content-center border-end">
    <img
      src={`http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}`}
      alt={maquinaria.nombre}
      className="img-fluid"
      style={{
        width: '80%',
        height: '80%',
        objectFit: 'contain',
      }}
    />
  </div>
);

export default MaquinariaInfo;