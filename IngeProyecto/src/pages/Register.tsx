import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dniFoto, setDniFoto] = useState<File | null>(null);
  const [dniNumero, setDniNumero] = useState('');
  const [error, setError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false); // NUEVO
  const navigate = useNavigate(); 
  const isFormValid = () => {
    return (
      nombre &&
      apellido &&
      email &&
      password &&
      fechaNacimiento &&
      dniFoto &&
      dniNumero // Asegúrate de incluir dniNumero aquí
    );
  };

  const limpiarCampos = () => {
    setNombre('');
    setApellido('');
    setFechaNacimiento('');
    setEmail('');
    setPassword('');
    setDniFoto(null);
    setDniNumero('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Todos los campos son obligatorios, incluyendo la foto del documento.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellido', apellido);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('fecha_nacimiento', fechaNacimiento);
      if (dniFoto) formData.append('dni_foto', dniFoto);
      formData.append('dni_numero', dniNumero);

      await axios.post('http://localhost:5000/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setRegistroExitoso(true); // NUEVO
      limpiarCampos(); // NUEVO
      // No navegues a login
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Hubo un problema al registrar el cliente.');
      }
    }
  };

  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-centered">
        <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '90%', border: '1px solid red'}}>
          <h2 className="text-center mb-4 text-danger">Registrarse</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
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

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña:</label>
              <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
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

            <div className="mb-3">
              <label htmlFor="dni_numero" className="form-label">Número de DNI:</label>
              <input
                type="text"
                id="dni_numero"
                className="form-control"
                value={dniNumero}
                onChange={e => setDniNumero(e.target.value)}
              />
            </div>
            {registroExitoso && (
              <div className="alert alert-success alert-dismissible fade show text-center p-2" role="alert">
                Tu registro fue exitoso, un empleado revisará tus datos y activará tu cuenta
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setRegistroExitoso(false)}
                  style={{ position: 'absolute', right: 10, top: 10 }}
                ></button>
              </div>
            )}
            {error && <div className="alert alert-danger text-center p-2">{error}</div>}
            <button type="submit" className="btn btn-danger w-100" disabled={!isFormValid()}>
              Registrarse
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
