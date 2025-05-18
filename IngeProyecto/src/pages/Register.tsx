import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const isFormValid = () => {
    return nombre && apellido && email && password && isChecked;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/register', {
        nombre,
        apellido,
        email,
        password,
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error en el registro:', error);
      setError('Hubo un problema con el registro.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center min-vh-100 pt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center mb-4 text-danger">Registro</h2>
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

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="age-checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="age-checkbox">
                Confirmo que soy mayor de 18 años
              </label>
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
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
