import React, { useEffect } from 'react';

const PagoExitoso: React.FC = () => {
  useEffect(() => {
    // Si estamos en túnel, redirigir a localhost
    if (window.location.hostname.includes('devtunnels.ms')) {
      const timer = setTimeout(() => {
        window.location.href = 'http://localhost:5173/pago-exitoso';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="container py-5 text-center">
      <div className="alert alert-success p-5 shadow-sm">
        <h1 className="mb-4">¡Gracias por tu alquiler!</h1>
        <p className="lead">Tu pago fue procesado correctamente.</p>
        <a href="http://localhost:5173/" className="btn btn-success mt-3">
          Volver al inicio
        </a>
        <br />
      </div>
    </div>
  );
};

export default PagoExitoso;
