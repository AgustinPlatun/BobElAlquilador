import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar/Navbar';

const RegistrarEmpleado: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');

  const isFormValid = () => {
    return nombre && apellido && email && password && fechaNacimiento;
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
        password,
        fecha_nacimiento: fechaNacimiento,
      };

      const response = await axios.post('http://localhost:5000/registrar-empleado', data);;

      alert(response.data.message);
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      setError('Hubo un problema al registrar el empleado.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="register-page-container d-flex justify-content-center align-items-center min-vh-100 pt-5" style={{ width: '100vw', height: '100vh' }}>
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '90%' }}>
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
              <label htmlFor="password" className="form-label">Contraseña:</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
