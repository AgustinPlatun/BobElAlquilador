import React from 'react';
import Navbar from '../Components/NavBar/Navbar';

const Contacto: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Contacto</h1>
        <p>Aca se muestra la info para contactarse con la empresa, direccion, etc</p>
      </div>
    </div>
  );
};

export default Contacto;