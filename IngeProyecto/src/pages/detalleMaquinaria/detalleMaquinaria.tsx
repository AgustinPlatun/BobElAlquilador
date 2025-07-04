import React from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import DetalleMaquinariaContent from './detalleMaquinariaContent';

const DetalleMaquinaria: React.FC = () => (
  <div className="full-page-layout">
    <Navbar />
    <div className="main-content-flex">
      <DetalleMaquinariaContent />
    </div>
    <Footer />
  </div>
);

export default DetalleMaquinaria;