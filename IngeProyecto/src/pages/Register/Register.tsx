import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import Navbar from '../../Components/Navbar/Navbar';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState(''); // Estado para los mensajes de error

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const isFormValid = () => {
    return nombre && apellido && email && password && isChecked;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    setError(''); // Limpiar el mensaje de error antes de intentar el envío

    try {
      // Enviar datos al backend
      const response = await axios.post('http://localhost:5000/register', {
        nombre,
        apellido,
        email,
        password
      });

      // Si la respuesta es exitosa, muestra un mensaje
      alert(response.data.message); // Mensaje que viene del backend
    } catch (error) {
      console.error("Error en el registro:", error);
      setError('Hubo un problema con el registro.'); // Mostrar mensaje de error
    }
  };

  return (
    <div>
      <Navbar />
      <div className="register-container">
        <div className="register-box">
          <h2 className="register-title">Registro</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre:</label>
              <input
                type="text"
                id="nombre"
                className="form-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido" className="form-label">Apellido:</label>
              <input
                type="text"
                id="apellido"
                className="form-input"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña:</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="age-checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="age-checkbox" className="checkbox-label">
                Confirmo que soy mayor de 18 años
              </label>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar mensaje de error */}
            <button
              type="submit"
              className="register-button"
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
