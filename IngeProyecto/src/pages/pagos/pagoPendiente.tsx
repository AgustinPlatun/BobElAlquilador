import React from 'react';
import { Link } from 'react-router-dom';

const PagoPendiente: React.FC = () => {
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-warning p-5 shadow-sm">
        <h1 className="mb-4">Pago pendiente</h1>
        <p className="lead">Estamos esperando la confirmación del pago. Te avisaremos cuando esté aprobado.</p>
        <Link to="/" className="btn btn-warning mt-3">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default PagoPendiente;
