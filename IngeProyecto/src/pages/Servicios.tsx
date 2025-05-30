import React, { useEffect, useState } from 'react';
import Card from '../Components/Card';
import Navbar from '../Components/NavBar/Navbar';

interface Maquinaria {
  id: number;
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
  codigo: string; 
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
      <div className="container py-5 mt-5 text-center" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
        <h1 className="mb-4">Nuestras Maquinarias</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row gx-4 gy-4 justify-content-center">
          {maquinarias.map((maquinaria) => (
            <div
              className="col-10 col-sm-4 col-md-3 col-lg-2 mb-2 px-1"
              key={maquinaria.id}
            >
              <Card
                image={`http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}`}
                name={maquinaria.nombre}
                description={maquinaria.descripcion}
                precio={Number(maquinaria.precio)}
              />
              {/* Ejemplo en una Card de maquinaria */}
              <h5 className="card-title">
                {maquinaria.nombre} <span className="badge bg-secondary ms-2">{maquinaria.codigo}</span>
              </h5>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Servicios;
