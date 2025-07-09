import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';

interface Maquinaria {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  foto?: string;
}

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_email: string;
  estado: string;
}

const colorEstado = (estado: string) => {
  switch (estado) {
    case 'esperando_retiro': return 'warning';
    case 'Activa': return 'success';
    case 'cancelada': return 'danger';
    case 'esperando_devolucion': return 'info';
    default: return 'secondary';
  }
};

const rojoPrincipal = '#b71c1c';
const rojoSecundario = '#f44336';

function isMaquinaria(m: any): m is Maquinaria {
  return (
    m &&
    typeof m === 'object' &&
    'id' in m &&
    typeof m.nombre === 'string' &&
    typeof m.codigo === 'string' &&
    typeof m.descripcion === 'string'
  );
}

const HistorialReservas: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState<Maquinaria | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaACancelar, setReservaACancelar] = useState<Reserva | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/maquinarias')
      .then(res => res.json())
      .then(data => setMaquinarias(data as Maquinaria[]))
      .catch(() => setError('Error al cargar maquinarias.'));
  }, []);

  const handleSeleccionar = (maq: Maquinaria) => {
    setMaquinariaSeleccionada(maq);
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/reservas-futuras-maquinaria/${maq.id}`)
      .then(res => res.json())
      .then(data => {
        setReservas(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar reservas.');
        setLoading(false);
      });
  };

  const hoy = new Date();
  const reservasOrdenadas = reservas.slice().sort((a, b) => {
    const inicioA = new Date(a.fecha_inicio);
    const inicioB = new Date(b.fecha_inicio);
    const esActualA = inicioA <= hoy && hoy <= new Date(a.fecha_fin);
    const esActualB = inicioB <= hoy && hoy <= new Date(b.fecha_fin);
    if (esActualA && !esActualB) return -1;
    if (!esActualA && esActualB) return 1;
    return inicioA.getTime() - inicioB.getTime();
  });

  // Función para saber si una reserva es cancelable por empleado
  const puedeCancelarReserva = (reserva: Reserva) => {
    const hoy = new Date();
    const inicio = new Date(reserva.fecha_inicio);
    // Solo si la reserva no está en periodo de alquiler y el estado es correcto
    return (reserva.estado === 'esperando_retiro' || reserva.estado === 'Activa') && inicio > hoy;
  };

  // Primer listado de maquinarias
  const maquinariasFiltradas = maquinarias
    .filter(
      m =>
        m &&
        typeof m === 'object' &&
        'id' in m &&
        (m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.codigo.toLowerCase().includes(busqueda.toLowerCase()))
    ) as { id: number; nombre: string; codigo: string; descripcion: string; foto?: string }[];

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="row mb-4 align-items-center justify-content-center">
          <div className="col-auto">
            <FaBoxOpen size={36} style={{ color: rojoPrincipal }} className="me-2" />
          </div>
          <div className="col-auto">
            <h2 className="fw-bold mb-0" style={{ color: rojoPrincipal }}>Historial de reservas de maquinaria</h2>
            <div className="text-muted" style={{ fontSize: 16 }}>Consulta y gestiona las reservas futuras de cada equipo</div>
          </div>
        </div>
        <div className="row g-4 justify-content-center">
          {!maquinariaSeleccionada ? (
            <div className="col-md-6">
              <div className="card shadow-sm border-0 mb-3" style={{ borderTop: `4px solid ${rojoSecundario}` }}>
                <div className="card-body">
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-light"><FaSearch style={{ color: rojoPrincipal }} /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar maquinaria por nombre o código..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: rojoPrincipal }}>Listado de maquinarias</h6>
                  <ul className="list-group" style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {maquinariasFiltradas.map((maquinaria: { id: number; nombre: string; codigo: string; descripcion: string; foto?: string }) => (
                      <li
                        key={(maquinaria as any).id}
                        className={`list-group-item d-flex align-items-center ${maquinariaSeleccionada?.id === (maquinaria as any).id ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSeleccionar(maquinaria)}
                      >
                        <img
                          src={maquinaria.foto ? `http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}` : '/images/default-maquinaria.svg'}
                          alt={maquinaria.nombre}
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, marginRight: 12, border: `2px solid ${rojoSecundario}` }}
                          onError={e => (e.currentTarget.src = '/images/default-maquinaria.svg')}
                        />
                        <div>
                          <span className="fw-bold" style={{ color: rojoPrincipal }}>{maquinaria.nombre}</span> <span className="text-muted">({maquinaria.codigo})</span>
                        </div>
                      </li>
                    ))}
                    {maquinariasFiltradas.length === 0 && (
                      <li className="list-group-item text-muted">No hay coincidencias</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="col-md-5">
                <div className="card shadow-sm border-0 mb-3" style={{ borderTop: `4px solid ${rojoSecundario}` }}>
                  <div className="card-body">
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-light"><FaSearch style={{ color: rojoPrincipal }} /></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar maquinaria por nombre o código..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                      />
                    </div>
                    <h6 className="fw-bold mb-2" style={{ color: rojoPrincipal }}>Listado de maquinarias</h6>
                    <ul className="list-group" style={{ maxHeight: 350, overflowY: 'auto' }}>
                      {maquinariasFiltradas.map((maquinaria: { id: number; nombre: string; codigo: string; descripcion: string; foto?: string }) => (
                        <li
                          key={(maquinaria as any).id}
                          className={`list-group-item d-flex align-items-center ${maquinariaSeleccionada?.id === (maquinaria as any).id ? 'active' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSeleccionar(maquinaria)}
                        >
                          <img
                            src={maquinaria.foto ? `http://localhost:5000/uploads/maquinarias_fotos/${maquinaria.foto}` : '/images/default-maquinaria.svg'}
                            alt={maquinaria.nombre}
                            style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, marginRight: 12, border: `2px solid ${rojoSecundario}` }}
                            onError={e => (e.currentTarget.src = '/images/default-maquinaria.svg')}
                          />
                          <div>
                            <span className="fw-bold" style={{ color: rojoPrincipal }}>{maquinaria.nombre}</span> <span className="text-muted">({maquinaria.codigo})</span>
                          </div>
                        </li>
                      ))}
                      {maquinariasFiltradas.length === 0 && (
                        <li className="list-group-item text-muted">No hay coincidencias</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={maquinariaSeleccionada.foto ? `http://localhost:5000/uploads/maquinarias_fotos/${maquinariaSeleccionada.foto}` : '/images/default-maquinaria.svg'}
                        alt={maquinariaSeleccionada.nombre}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12, border: `2px solid ${rojoSecundario}`, marginRight: 18 }}
                        onError={e => (e.currentTarget.src = '/images/default-maquinaria.svg')}
                      />
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: rojoPrincipal }}>{maquinariaSeleccionada.nombre}</h5>
                        <div className="text-muted" style={{ fontSize: 15 }}><strong>Código:</strong> {maquinariaSeleccionada.codigo}</div>
                      </div>
                    </div>
                    <div className="mb-2"><strong>Descripción:</strong> {maquinariaSeleccionada.descripcion}</div>
                    <hr />
                    <h6 className="fw-bold mb-3" style={{ color: rojoPrincipal }}>Reservas futuras</h6>
                    {loading && <div className="text-primary">Cargando reservas...</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {reservasOrdenadas.length === 0 && !loading && <div className="text-muted">No hay reservas futuras.</div>}
                    <ul className="list-group" style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {reservasOrdenadas.map((res, idx) => {
                        const inicio = new Date(res.fecha_inicio);
                        const fin = new Date(res.fecha_fin);
                        const esActual = inicio <= hoy && hoy <= fin;
                        return (
                          <li key={res.id} className={`list-group-item d-flex align-items-center ${esActual ? 'list-group-item-warning' : ''}`} style={{ borderLeft: esActual ? `5px solid ${rojoSecundario}` : undefined }}>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <span className="fw-bold me-2" style={{ fontSize: 16, color: rojoPrincipal }}>{esActual ? 'Reserva actual' : `Reserva #${idx + 1}`}</span>
                                <Badge bg={colorEstado(res.estado)} className="ms-2 text-uppercase">{res.estado}</Badge>
                              </div>
                              <div style={{ fontSize: 15 }}>
                                <span className="me-2"><strong>Desde:</strong> {res.fecha_inicio}</span>
                                <span><strong>Hasta:</strong> {res.fecha_fin}</span>
                              </div>
                              <div style={{ fontSize: 15 }}>
                                <span><strong>Cliente:</strong> {res.usuario_nombre} {res.usuario_apellido} ({res.usuario_email})</span>
                              </div>
                            </div>
                            {/* Botón cancelar solo si es cancelable */}
                            {puedeCancelarReserva(res) && (
                              <button
                                className="btn btn-danger btn-sm ms-3"
                                onClick={() => {
                                  setReservaACancelar(res);
                                  setShowCancelModal(true);
                                }}
                              >
                                Cancelar
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modal de confirmación de cancelación */}
      {showCancelModal && reservaACancelar && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-warning">Confirmar Cancelación</h5>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas cancelar la reserva de <b>{reservaACancelar.usuario_nombre} {reservaACancelar.usuario_apellido}</b>?</p>
                <p>Se notificará al cliente por email.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>No</button>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    setShowCancelModal(false);
                    setReservaACancelar(null);
                    await fetch(`http://localhost:5000/cancelar-reserva-empleado/${reservaACancelar.id}`, { method: 'PUT' });
                    // Recargar reservas de la maquinaria seleccionada
                    handleSeleccionar(maquinariaSeleccionada!);
                  }}
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistorialReservas; 