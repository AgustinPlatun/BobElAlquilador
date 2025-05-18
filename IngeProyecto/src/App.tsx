import React from 'react';
import Navbar from './Components/NavBar/Navbar';

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div></div>
        <main>
          <h1>Este es el Inicio</h1>
          <p>Aca va un poco de viri viri de la empresa</p>
        </main>
    </div>
  );
};

export default App;
