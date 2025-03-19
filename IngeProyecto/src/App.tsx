import React from 'react';
import Navbar from './Components/Navbar/Navbar.tsx';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <main>
      <div>ESTO ES EL INICIO</div>
      </main>
    </div>
  );
};

export default App;