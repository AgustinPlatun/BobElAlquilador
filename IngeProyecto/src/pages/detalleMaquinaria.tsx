import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar/Navbar';

interface Maquinaria {
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
}

const DetalleMaquinaria: React.FC = () => {
  const { nombre } = useParams();
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/maquinarias')
      .then(res => res.json())
      .then(data => {
        const found = data.find((m: Maquinaria) => m.nombre === nombre);
        setMaquinaria(found);
      });
  }, [nombre]);

  const handleAlquilar = async () => {
    const usuarioNombre = localStorage.getItem('usuarioNombre');

    if (!usuarioNombre) {
      alert('Debes iniciar sesión para alquilar.');
      navigate('/login');
      return;
    }

    if (!maquinaria) return;

    try {
      const response = await fetch('http://localhost:5000/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: maquinaria.nombre,
          precio: maquinaria.precio,
          cantidad: cantidad,
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('No se pudo iniciar el proceso de pago.');
      }
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
      alert('Hubo un error al procesar el pago.');
    }
  };

  if (!maquinaria) return <div className="text-center py-5">Cargando...</div>;

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="row bg-white shadow-sm rounded p-4 align-items-stretch" style={{ minHeight: '550px' }}>
              <div className="col-md-7 d-flex align-items-center justify-content-center border-end">
                <img
                  src={`http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}`}
                  alt={maquinaria.nombre}
                  className="img-fluid"
                  style={{
                    width: '80%',
                    height: '80%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div className="col-md-5 d-flex flex-column justify-content-between">
                <div>
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.8rem' }}>
                    {maquinaria.nombre}
                  </h2>
                  <h3 className="text-success fw-bold mb-4" style={{ fontSize: '2rem' }}>
                    ${maquinaria.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="mb-3">
                    <label htmlFor="cantidad" className="form-label fw-semibold">Cantidad</label>
                    <input
                      type="number"
                      id="cantidad"
                      min={1}
                      value={cantidad}
                      onChange={(e) => setCantidad(Number(e.target.value))}
                      className="form-control"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-danger fw-bold"
                  style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
                  onClick={handleAlquilar}
                >
                  Alquilar
                </button>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded p-4 mt-4">
              <h4 className="fw-bold mb-3">Descripción</h4>
              <p style={{ fontSize: '1.1rem' }}>{maquinaria.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetalleMaquinaria;
