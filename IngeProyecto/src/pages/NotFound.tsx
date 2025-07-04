import React from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

const NotFound: React.FC = () => (
  <div>
    <Navbar />
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="alert alert-danger text-center" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-3">Página no encontrada</h2>
        <p>La URL que intentaste abrir no existe o no está disponible.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default NotFound;