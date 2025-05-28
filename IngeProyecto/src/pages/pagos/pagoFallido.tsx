import React from 'react';
import { Link } from 'react-router-dom';

const PagoFallido: React.FC = () => {
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger p-5 shadow-sm">
        <h1 className="mb-4">¡Algo salió mal!</h1>
        <p className="lead">Tu pago no pudo ser procesado. Por favor, intentá nuevamente.</p>
        <Link to="/" className="btn btn-danger mt-3">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default PagoFallido;
