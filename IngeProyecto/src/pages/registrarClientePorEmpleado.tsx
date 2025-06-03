import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar/Navbar';

const RegistrarCliente: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [dniFoto, setDniFoto] = useState<File | null>(null);
  const [dniNumero, setDniNumero] = useState('');
  const [error, setError] = useState('');

  const isFormValid = () => {
    return nombre && apellido && email && fechaNacimiento && dniFoto && dniNumero;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const data = {
        nombre,
        apellido,
        email,
        fecha_nacimiento: fechaNacimiento,
        dni_numero: dniNumero,
      };

      const response = await axios.post('http://localhost:5000/registrar-cliente', data);

      alert(response.data.message);
    } catch (error: any) {
      // Mostrar mensaje del backend si existe
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Hubo un problema al registrar el cliente.');
      }
    }
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{
          minHeight: "calc(100vh - 80px)",
          marginTop: "80px", 
        }}
      >
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center mb-4 text-danger">Registrar Cliente</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre:</label>
              <input type="text" id="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="apellido" className="form-label">Apellido:</label>
              <input type="text" id="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="fecha_nacimiento" className="form-label">Fecha de nacimiento:</label>
              <input type="date" id="fecha_nacimiento" className="form-control" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* Cambiado el orden: primero foto, luego número */}
            <div className="mb-3">
              <label htmlFor="dni_foto" className="form-label">Foto del Documento (DNI):</label>
              <input
                type="file"
                id="dni_foto"
                className="form-control"
                accept="image/*"
                onChange={(e) => setDniFoto(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="dni_numero" className="form-label">Número de DNI:</label>
              <input
                type="text"
                id="dni_numero"
                className="form-control"
                value={dniNumero}
                onChange={e => setDniNumero(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger text-center p-2">{error}</div>}

            <button type="submit" className="btn btn-danger w-100" disabled={!isFormValid()}>
              Registrar nuevo usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarCliente;
