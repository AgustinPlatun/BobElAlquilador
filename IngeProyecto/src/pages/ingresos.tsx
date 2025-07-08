import React, { useState, useEffect } from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

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

interface Categoria {
  id: number;
  nombre: string;
}

const Ingresos: React.FC = () => {
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresoMensual[]>([]);
  const [ingresosAnuales, setIngresosAnuales] = useState<IngresoAnual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState<'mensual' | 'anual' | null>(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  useEffect(() => {
    cargarAniosDisponibles();
    cargarCategorias();
  }, []);

  const cargarAniosDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:5000/anios-disponibles');
      if (response.ok) {
        const data = await response.json();
        if (data.anio_minimo && data.anio_maximo) {
          const anios = [];
          for (let anio = data.anio_maximo; anio >= data.anio_minimo; anio--) {
            anios.push(anio);
          }
          setAniosDisponibles(anios);
        } else {
          setAniosDisponibles([new Date().getFullYear()]);
        }
      } else {
        setAniosDisponibles(Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i));
      }
    } catch (err) {
      setAniosDisponibles(Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i));
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await fetch('http://localhost:5000/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validar que se haya seleccionado un año para vista mensual
      if (vista === 'mensual' && !anioSeleccionado) {
        setError('Por favor selecciona un año');
        return;
      }
      
      let url = vista === 'mensual' 
        ? `http://localhost:5000/ingresos-mensuales/${anioSeleccionado}`
        : 'http://localhost:5000/ingresos-anuales';
      
      if (categoriaSeleccionada) {
        url += `?categoria_id=${categoriaSeleccionada}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        vista === 'mensual' ? setIngresosMensuales(data) : setIngresosAnuales(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Error al cargar los ingresos ${vista}es`);
      }
    } catch (err) {
      setError('Error de conexión al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  };

  const handleVistaChange = (nuevaVista: 'mensual' | 'anual') => {
    if (vista === nuevaVista) return;
    
    setVista(nuevaVista);
    setIngresosMensuales([]);
    setIngresosAnuales([]);
    setError('');
    setAnioSeleccionado(null);
    setCategoriaSeleccionada(null);
  };

  const obtenerIngresoMensual = (mes: number) => {
    return ingresosMensuales.find(ingreso => ingreso.mes === mes) || {
      mes, mes_nombre: meses[mes - 1], total: 0, cantidad_reservas: 0
    };
  };

  const renderContent = () => {
    if (!vista) {
      return (
        <div className="text-center">
          <h2 className="fw-bold mb-3">Reporte de Ingresos</h2>
          <p className="text-muted mb-4">Selecciona el tipo de reporte que deseas ver</p>
          <div className="btn-group">
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('mensual')}>
              Ingresos Mensuales
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleVistaChange('anual')}>
              Ingresos Anuales
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando ingresos...</p>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger text-center">{error}</div>;
    }

    const hayDatos = vista === 'mensual' 
      ? ingresosMensuales.some(item => item.total > 0)
      : ingresosAnuales.length > 0;

    return (
      <>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3">Reporte de Ingresos</h2>
          <div className="btn-group mb-3">
            {['mensual', 'anual'].map(tipo => (
              <button
                key={tipo}
                className={`btn ${vista === tipo ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleVistaChange(tipo as 'mensual' | 'anual')}
              >
                Ingresos {tipo === 'mensual' ? 'Mensuales' : 'Anuales'}
              </button>
            ))}
          </div>
          
          {vista === 'mensual' && (
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
              <div>
                <label htmlFor="anioSelector" className="form-label me-2">Año:</label>
                <select
                  id="anioSelector"
                  className="form-select d-inline-block w-auto"
                  value={anioSeleccionado || ''}
                  onChange={(e) => setAnioSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Seleccionar año</option>
                  {aniosDisponibles.map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="categoriaSelector" className="form-label me-2">Categoría:</label>
                <select
                  id="categoriaSelector"
                  className="form-select d-inline-block w-auto"
                  value={categoriaSeleccionada || ''}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary ms-2"
                onClick={cargarIngresos}
                disabled={!anioSeleccionado}
              >
                <i className="fas fa-search me-1"></i>
                Buscar
              </button>
            </div>
          )}

          {vista === 'anual' && (
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
              <div>
                <label htmlFor="categoriaSelector" className="form-label me-2">Categoría:</label>
                <select
                  id="categoriaSelector"
                  className="form-select d-inline-block w-auto"
                  value={categoriaSeleccionada || ''}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className="btn btn-primary ms-2"
                onClick={cargarIngresos}
              >
                <i className="fas fa-search me-1"></i>
                Buscar
              </button>
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {vista === 'mensual' 
                ? `Ingresos Mensuales${anioSeleccionado ? ` - ${anioSeleccionado}` : ''}`
                : 'Ingresos Anuales'
              }
              {categoriaSeleccionada && (
                <span className="badge bg-light text-primary ms-2">
                  {categorias.find(c => c.id === categoriaSeleccionada)?.nombre}
                </span>
              )}
            </h5>
          </div>
          <div className="card-body">
            {!hayDatos ? (
              <div className="text-center py-4">
                <p className="text-muted mb-0">
                  No hay ingresos registrados
                </p>
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
                    {vista === 'mensual'
                      ? (
                          meses.map((mes, index) => {
                            const ingreso = obtenerIngresoMensual(index + 1);
                            return { ...ingreso, mes_nombre: mes };
                          }).map((ingreso, idx) => (
                            <tr key={ingreso.mes || idx}>
                              <td className="fw-bold">{ingreso.mes_nombre}</td>
                              <td className={`fw-bold ${ingreso.total > 0 ? 'text-success' : 'text-muted'}`}>
                                ${ingreso.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </td>
                              <td>
                                <span className={`badge ${ingreso.cantidad_reservas > 0 ? 'bg-info' : 'bg-secondary'}`}>
                                  {ingreso.cantidad_reservas}
                                </span>
                              </td>
                            </tr>
                          ))
                        )
                      : (
                          ingresosAnuales.map((item) => (
                            <tr key={item.anio}>
                              <td className="fw-bold">{item.anio}</td>
                              <td className="text-success fw-bold">
                                ${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </td>
                              <td>
                                <span className="badge bg-info">{item.cantidad_reservas}</span>
                              </td>
                            </tr>
                          ))
                        )
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-flex">
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <div className="container py-5">
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Ingresos;