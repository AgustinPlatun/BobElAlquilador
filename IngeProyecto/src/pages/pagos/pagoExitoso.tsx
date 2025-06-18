import React from 'react';
import { Link } from 'react-router-dom';

const PagoExitoso: React.FC = () => {
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-success p-5 shadow-sm">
        <h1 className="mb-4">¡Gracias por tu alquiler!</h1>
        <p className="lead">Tu pago fue procesado correctamente.</p>
        <Link to="/" className="btn btn-success mt-3">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default PagoExitoso;
