import React, { useState, useEffect } from 'react';
import Navbar from '../Components/NavBar/Navbar';

interface IngresoMensual {
  mes: number;
  mes_nombre: string;
  total: number;
  cantidad_reservas: number;
}

interface IngresoAnual {
  anio: number;
  total: number;
  cantidad_reservas: number;
}

const Ingresos: React.FC = () => {
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresoMensual[]>([]);
  const [ingresosAnuales, setIngresosAnuales] = useState<IngresoAnual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState<'mensual' | 'anual' | null>(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  const meses = [
    { numero: 1, nombre: 'Enero' },
    { numero: 2, nombre: 'Febrero' },
    { numero: 3, nombre: 'Marzo' },
    { numero: 4, nombre: 'Abril' },
    { numero: 5, nombre: 'Mayo' },
    { numero: 6, nombre: 'Junio' },
    { numero: 7, nombre: 'Julio' },
    { numero: 8, nombre: 'Agosto' },
    { numero: 9, nombre: 'Septiembre' },
    { numero: 10, nombre: 'Octubre' },
    { numero: 11, nombre: 'Noviembre' },
    { numero: 12, nombre: 'Diciembre' }
  ];

  useEffect(() => {
    if (vista) {
      cargarIngresos();
    }
  }, [vista, anioSeleccionado]);

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (vista === 'mensual') {
        const response = await fetch(`http://localhost:5000/ingresos-mensuales/${anioSeleccionado}`);
        if (response.ok) {
          const data = await response.json();
          setIngresosMensuales(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error al cargar los ingresos mensuales');
        }
      } else if (vista === 'anual') {
        const response = await fetch('http://localhost:5000/ingresos-anuales');
        if (response.ok) {
          const data = await response.json();
          setIngresosAnuales(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error al cargar los ingresos anuales');
        }
      }
    } catch (err) {
      setError('Error de conexión al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  };

  const handleVistaChange = (nuevaVista: 'mensual' | 'anual') => {
    setVista(nuevaVista);
    setIngresosMensuales([]);
    setIngresosAnuales([]);
    setError('');
  };

  const obtenerIngresoMensual = (mes: number) => {
    return ingresosMensuales.find(ingreso => ingreso.mes === mes) || {
      mes: mes,
      mes_nombre: meses.find(m => m.numero === mes)?.nombre || '',
      total: 0,
      cantidad_reservas: 0
    };
  };

  if (!vista) {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-3">Reporte de Ingresos</h2>
                <p className="text-muted">Selecciona el tipo de reporte que deseas ver</p>
              </div>

              {/* Selector de vista */}
              <div className="d-flex justify-content-center">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleVistaChange('mensual')}
                  >
                    Ingresos Mensuales
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleVistaChange('anual')}
                  >
                    Ingresos Anuales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando ingresos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">Reporte de Ingresos</h2>
            </div>

            {/* Selector de vista */}
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${vista === 'mensual' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleVistaChange('mensual')}
                >
                  Ingresos Mensuales
                </button>
                <button
                  type="button"
                  className={`btn ${vista === 'anual' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleVistaChange('anual')}
                >
                  Ingresos Anuales
                </button>
              </div>
            </div>

            {/* Selector de año para vista mensual */}
            {vista === 'mensual' && (
              <div className="text-center mb-4">
                <label htmlFor="anioSelector" className="form-label me-2">Año:</label>
                <select
                  id="anioSelector"
                  className="form-select d-inline-block w-auto"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tabla de ingresos */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  {vista === 'mensual' ? `Ingresos Mensuales - ${anioSeleccionado}` : 'Ingresos Anuales'}
                </h5>
              </div>
              <div className="card-body">
                {vista === 'mensual' && (ingresosMensuales.length === 0 || ingresosMensuales.every(item => item.total === 0)) ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">No hay ingresos registrados para el año {anioSeleccionado}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>{vista === 'mensual' ? 'Mes' : 'Año'}</th>
                          <th>Ingresos</th>
                          <th>Reservas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vista === 'mensual' ? (
                          // Mostrar todos los 12 meses
                          meses.map((mes) => {
                            const ingreso = obtenerIngresoMensual(mes.numero);
                            return (
                              <tr key={mes.numero}>
                                <td className="fw-bold">
                                  {mes.nombre}
                                </td>
                                <td className={`fw-bold ${ingreso.total > 0 ? 'text-success' : 'text-muted'}`}>
                                  ${ingreso.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </td>
                                <td>
                                  <span className={`badge ${ingreso.cantidad_reservas > 0 ? 'bg-info' : 'bg-secondary'}`}>
                                    {ingreso.cantidad_reservas}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          // Mostrar años con datos
                          ingresosAnuales.length > 0 ? (
                            ingresosAnuales.map((item) => {
                              const anualItem = item as IngresoAnual;
                              return (
                                <tr key={anualItem.anio}>
                                  <td className="fw-bold">
                                    {anualItem.anio}
                                  </td>
                                  <td className="text-success fw-bold">
                                    ${anualItem.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td>
                                    <span className="badge bg-info">{anualItem.cantidad_reservas}</span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center text-muted py-4">
                                No hay ingresos anuales registrados
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingresos; 