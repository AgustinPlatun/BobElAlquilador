import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  image: string;
  name: string;
  description: string;
  precio: number;
}

const Card: React.FC<CardProps> = ({ image, name, description, precio }) => {
  const navigate = useNavigate();

  const handleAlquilar = () => {
    navigate(`/detalle-maquinaria/${encodeURIComponent(name)}`);
  };

  return (
    <div
      className="card border border-danger shadow-sm rounded-3 text-center p-3 d-flex flex-column"
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
        className="img-fluid rounded mb-3 border"
        style={{ height: '200px', objectFit: 'fill', width: '100%' }}
      />
      <h3 className="fs-4 fw-semibold text-dark mb-3">{name}</h3>
      <p className="text-muted flex-grow-1 mb-3" style={{ overflow: 'hidden' }}>
        {description}
      </p>
      <p className="fw-bold text-success mb-2">${precio.toFixed(2)}</p>
      <button className="btn btn-danger px-4 py-2 mt-auto" onClick={handleAlquilar}>
        Ver detalle
      </button>
    </div>
  );
};

export default Card;
