import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';

const AltaEmpleado: React.FC = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('http://localhost:5000/clientes-activos');
        const data = await res.json();
        setClientes(data);
      } catch {
        setError('Error al obtener los clientes.');
      }
    };
    fetchClientes();
  }, []);

  const handleAltaEmpleado = async () => {
    setMensaje('');
    setError('');
    if (!email) {
      setError('Por favor, seleccione un usuario.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/alta-empleado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const resData = await response.json();
      if (response.ok) {
        setMensaje(resData.message || 'Usuario promovido a empleado correctamente.');
        setEmail('');
        setClientes(clientes.filter((c) => c.email !== email));
      } else {
        setError(resData.message || 'No se pudo dar de alta el empleado.');
      }
    } catch (error) {
      setError('Hubo un problema al dar de alta el empleado.');
    }
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-centered">
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid green' }}>
          <h2 className="text-center mb-4">Promover a empleado</h2>
          <div className="mb-3">
            <select
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              <option value="">Seleccioná un cliente activo</option>
              {clientes.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.email}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-success w-100 mb-3" onClick={handleAltaEmpleado} disabled={!email}>
            Promover empleado
          </button>
          {mensaje && (
            <div className="alert alert-info text-center p-2" role="alert">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="alert alert-danger text-center p-2" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AltaEmpleado;