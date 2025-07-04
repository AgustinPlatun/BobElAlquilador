import React from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

const NotFound: React.FC = () => (
  <div className="full-page-layout">
    <Navbar />
    <div className="main-content-centered">
      <div className="alert alert-danger text-center" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-3">Página no encontrada</h2>
        <p>La URL que intentaste abrir no existe o no está disponible.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default NotFound;