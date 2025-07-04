import React from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import DetalleMaquinariaContent from './detalleMaquinariaContent';

const DetalleMaquinaria: React.FC = () => (
  <>
    <Navbar />
    <DetalleMaquinariaContent />
    <Footer />
  </>
);

export default DetalleMaquinaria;