import React, { useState } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import RetiroMaquinaria from './RetiroMaquinaria';
import DevolucionMaquinaria from './DevolucionMaquinaria';

const GestionReservas: React.FC = () => {
  const [vista, setVista] = useState<'inicio' | 'fin' | null>(null);

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  const handleVistaChange = (nuevaVista: 'inicio' | 'fin') => {
    setVista(nuevaVista);
  };

  const renderContent = () => {
    if (!vista) {
      return (
        <div className="text-center">
          <h2 className="fw-bold mb-3">Gestión de reservas y alquileres</h2>
          <p className="text-muted mb-4">Selecciona el tipo de gestión que deseas realizar para la fecha: {fechaHoy}</p>
          <div className="btn-group">
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('inicio')}>
              Retiro de maquinaria
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('fin')}>
              Devolución de maquinaria
            </button>
          </div>
        </div>
      );
    }

    if (vista === 'inicio') {
      return <RetiroMaquinaria onVistaChange={handleVistaChange} />;
    }

    if (vista === 'fin') {
      return <DevolucionMaquinaria onVistaChange={handleVistaChange} />;
    }

    return null;
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <div className="container py-5">
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GestionReservas;
