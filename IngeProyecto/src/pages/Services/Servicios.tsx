import React from 'react';
import Card from '../../Components/Card/Card';
import './Servicios.css';
import Navbar from '../../Components/Navbar/Navbar';
const Servicios: React.FC = () => {
  const servicios = [
    {
      id: 1,
      name: 'Servicio 1',
      description: 'Descripción del servicio 1. Este es un ejemplo de descripción.',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: 2,
      name: 'Servicio 2',
      description: 'Descripción del servicio 2. Este es un ejemplo de descripción.',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: 3,
      name: 'Servicio 3',
      description: 'Descripción del servicio 3. Este es un ejemplo de descripción.',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: 4,
      name: 'Servicio 4',
      description: 'Descripción del servicio 4. Este es un ejemplo de descripción.',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: 5,
      name: 'Servicio 5',
      description: 'Descripción del servicio 5. Este es un ejemplo de descripción.',
      image: 'https://via.placeholder.com/300',
    },
  ];

  return (
    <div>
      <Navbar></Navbar>
      <div className="servicios-container">
      <h1>Nuestros Servicios</h1>
      <div className="cards-container">
        {servicios.map((servicio) => (
          <Card
            key={servicio.id}
            image={servicio.image}
            name={servicio.name}
            description={servicio.description}
          />
        ))}
      </div>
    </div>
    </div>
  );
};

export default Servicios;