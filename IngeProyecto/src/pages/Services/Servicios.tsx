import React, { useEffect, useState } from 'react';
import Card from '../../Components/Card/Card';
import './Servicios.css';
import Navbar from '../../Components/Navbar/Navbar';

interface Maquinaria {
  id: number;
  nombre: string;
  descripcion: string;
  foto: string;
}

const Servicios: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaquinarias = async () => {
      try {
        const response = await fetch('http://localhost:5000/maquinarias');
        if (!response.ok) {
          throw new Error('Error al obtener las maquinarias');
        }
        const data = await response.json();
        setMaquinarias(data);
      } catch (err) {
        setError('Hubo un problema al cargar las maquinarias.');
        console.error(err);
      }
    };

    fetchMaquinarias();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="servicios-container">
        <h1>Nuestras Maquinarias</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="cards-container">
          {maquinarias.map((maquinaria) => (
            <Card
              key={maquinaria.id}
              image={`http://localhost:5000/uploads/${maquinaria.foto}`}
              name={maquinaria.nombre}
              description={maquinaria.descripcion}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Servicios;