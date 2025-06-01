import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar/Navbar';

const RegistrarEmpleado: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [dniFoto, setDniFoto] = useState<File | null>(null);
  const [dniNumero, setDniNumero] = useState('');
  const [error, setError] = useState('');

  const isDniValido = (dni: string) => /^\d{8}$/.test(dni);
  const isEmailValido = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFechaValida = (fecha: string) => {
    // Espera formato YYYY-MM-DD
    const partes = fecha.split("-");
    return partes[0] && partes[0].length === 4 && /^\d{4}$/.test(partes[0]);
  };

  const isFormValid = () => {
    return (
      nombre &&
      apellido &&
      email &&
      fechaNacimiento &&
      dniFoto &&
      dniNumero &&
      isDniValido(dniNumero) &&
      isEmailValido(email) &&
      isFechaValida(fechaNacimiento)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !email || !fechaNacimiento || !dniFoto || !dniNumero) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!isDniValido(dniNumero)) {
      setError('El DNI debe contener exactamente 8 números y no letras.');
      return;
    }
    if (!isEmailValido(email)) {
      setError('El email no es válido.');
      return;
    }
    if (!isFechaValida(fechaNacimiento)) {
      setError('El año de la fecha debe tener 4 dígitos.');
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

      const response = await axios.post('http://localhost:5000/registrar-empleado', data);
      alert(response.data.message);
    } catch (error: any) {
      // MOSTRAR mensaje del backend si existe
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Hubo un problema al registrar el empleado.');
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
          <h2 className="text-center mb-4 text-danger">Registrar Empleado</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre:</label>
              <input
                type="text"
                id="nombre"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="apellido" className="form-label">Apellido:</label>
              <input
                type="text"
                id="apellido"
                className="form-control"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="fecha_nacimiento" className="form-label">Fecha de nacimiento:</label>
              <input
                type="date"
                id="fecha_nacimiento"
                className="form-control"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {error && (
              <div className="alert alert-danger text-center p-2" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-danger w-100"
              disabled={!isFormValid()}
            >
              Registrar nuevo empleado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarEmpleado;
