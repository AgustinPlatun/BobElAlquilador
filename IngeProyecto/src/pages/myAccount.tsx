import React from 'react';
import Navbar from '../Components/Navbar';

const MiCuenta: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Mi Cuenta</h1>
        <p>Aca se muestra la informacion del usuario y va a poder modificarla</p>
      </div>
    </div>
  );
};

export default MiCuenta;