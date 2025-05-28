import React, { useEffect, useState } from 'react';
import Navbar from './Components/NavBar/Navbar';
import { useLocation } from 'react-router-dom';

const App: React.FC = () => {
  const location = useLocation();
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');

    if (status === 'success') {
      setMensaje('✅ Alquiler efectuado con éxito');
    } else if (status === 'failure') {
      setMensaje('❌ El pago fue rechazado');
    } else if (status === 'pending') {
      setMensaje('⏳ El pago está pendiente de aprobación');
    }
  }, [location.search]);

  return (
    <div>
      <Navbar />
      {mensaje && (
        <div className="alert alert-info text-center fw-bold" role="alert">
          {mensaje}
        </div>
      )}
      <main className="container text-center py-4">
        <h1>Este es el Inicio</h1>
        <p>Aca va un poco de viri viri de la empresa</p>
      </main>
    </div>
  );
};

export default App;
