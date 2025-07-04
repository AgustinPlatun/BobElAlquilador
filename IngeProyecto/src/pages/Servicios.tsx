import React, { useEffect, useState } from 'react';
import Card from '../Components/Card';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

interface Maquinaria {
  id: number;
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
  codigo: string;
  categoria: string;
  politicas_reembolso: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

const Servicios: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

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

    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://localhost:5000/categorias-activas');
        if (!response.ok) {
          throw new Error('Error al obtener las categorías');
        }
        const data = await response.json();
        setCategorias(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMaquinarias();
    fetchCategorias();
  }, []);

  // Filtrar maquinarias por categoría seleccionada
  const maquinariasFiltradas = categoriaSeleccionada
    ? maquinarias.filter(m => m.categoria === categoriaSeleccionada)
    : maquinarias;

  return (
    <div>
      <Navbar />
      <div className="container py-5 text-center" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
        <h1 className="mb-4">Nuestras Maquinarias</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row gx-4 gy-4 justify-content-center" style={{ marginLeft: '10px', marginRight: '10px' }}>
          {/* Filtros a la izquierda */}
          <div className="col-12 col-md-3 col-lg-2 mb-4 text-start">
            <div className="bg-white border rounded shadow-sm p-3">
              <h5 className="fw-bold mb-3">Filtros</h5>
              <div>
                {categorias.length === 0 && (
                  <div className="text-muted">No hay categorías</div>
                )}
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    className={`btn btn-sm w-100 text-start mb-2 ${categoriaSeleccionada === cat.nombre ? 'bg-secondary text-white' : 'bg-light text-dark'}`}
                    style={{
                      border: 'none',
                      borderRadius: '20px',
                      boxShadow: categoriaSeleccionada === cat.nombre ? '0 0 0 2px #6c757d' : 'none'
                    }}
                    onClick={() =>
                      setCategoriaSeleccionada(
                        categoriaSeleccionada === cat.nombre ? null : cat.nombre
                      )
                    }
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Cards de maquinarias */}
          <div className="col-12 col-md-9 col-lg-10">
            <div className="row gx-5 gy-4 justify-content-center">
              {maquinariasFiltradas.length === 0 && (
                <div className="text-muted mt-4">No hay maquinarias para esta categoría.</div>
              )}
              {maquinariasFiltradas.map((maquinaria) => (
                <div
                  className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3 px-2"
                  key={maquinaria.id}
                >
                  <Card
                    image={`http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}`}
                    name={maquinaria.nombre}
                    description={maquinaria.descripcion}
                    precio={Number(maquinaria.precio)}
                    codigo={maquinaria.codigo}
                    categoria={maquinaria.categoria}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Servicios;
