import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  image: string;
  name: string;
  description: string;
  precio: number;
  codigo: string;
  categoria?: string;
}

const Card: React.FC<CardProps> = ({ image, name, description, precio, codigo, categoria }) => {
  const navigate = useNavigate();

  const handleAlquilar = () => {
    navigate(`/detalle-maquinaria/${encodeURIComponent(name)}`);
  };

  return (
    <div
      className="card border border-danger shadow-sm rounded-3 text-center p-3 d-flex flex-column h-100"
      style={{
        width: '100%',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-5px)';
        el.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <img
        src={image}
        alt={name}
        className="img-fluid rounded mb-3 border card-img-top"
        style={{ height: '200px', objectFit: 'fill', width: '100%' }}
      />
      <div className="card-body">
        <h3 className="fs-4 fw-semibold text-dark mb-1 card-title">{name}</h3>
        <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
          {categoria && categoria.trim() !== '' ? categoria : '-'}
        </div>
        <span className="badge bg-secondary mb-2">{codigo}</span>
        <p className="fw-bold text-success mb-2 card-text">${precio.toFixed(2)}</p>
        <button className="btn btn-danger px-4 py-2 mt-auto" onClick={handleAlquilar}>
          Ver detalle
        </button>
      </div>
    </div>
  );
};

export default Card;
