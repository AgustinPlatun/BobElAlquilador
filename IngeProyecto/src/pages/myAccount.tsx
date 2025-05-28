import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar/Navbar';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MisDatos: React.FC = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem('usuarioEmail');
  const nombre = localStorage.getItem('usuarioNombre');
  const rol = localStorage.getItem('usuarioRol');

  const [apellido, setApellido] = useState('');

  // Estados para cambiar contraseña
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensajePassword, setMensajePassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  // Estados para eliminar cuenta
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [passwordEliminar, setPasswordEliminar] = useState('');
  const [mensajeEliminar, setMensajeEliminar] = useState('');
  const [errorEliminar, setErrorEliminar] = useState('');

  useEffect(() => {
    const fetchApellido = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/usuario?email=${email}`);
        setApellido(response.data.apellido);
      } catch (error) {
        console.error('Error al obtener apellido:', error);
      }
    };
    if (email) fetchApellido();
  }, [email]);

  const handleCambiarPassword = async () => {
    setMensajePassword('');
    setErrorPassword('');

    if (!passwordActual || !nuevaPassword) {
      setErrorPassword('Debe completar ambos campos.');
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/cambiar-password', {
        email,
        password_actual: passwordActual,
        nueva_password: nuevaPassword,
      });
      setMensajePassword(response.data.message);
      setPasswordActual('');
      setNuevaPassword('');
    } catch (error: any) {
      setErrorPassword(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  const handleEliminarCuenta = async () => {
    setMensajeEliminar('');
    setErrorEliminar('');

    if (!passwordEliminar) {
      setErrorEliminar('Debe ingresar su contraseña para eliminar la cuenta.');
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/baja-cuenta', {
        email,
        password: passwordEliminar,
      });
      setMensajeEliminar(response.data.message);
      setPasswordEliminar('');

      // Cerrar sesión limpiando localStorage y redirigiendo a login
      localStorage.clear();
      navigate('/login');
    } catch (error: any) {
      setErrorEliminar(error.response?.data?.message || 'Error al eliminar la cuenta');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="card p-4 shadow" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="text-center text-danger mb-3">Mis Datos</h3>
          <p><strong>Nombre:</strong> {nombre}</p>
          <p><strong>Apellido:</strong> {apellido}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Rol:</strong> {rol}</p>

          <hr />

          <Button variant="warning" className="mb-3" onClick={() => {
            setShowModalPassword(true);
            setMensajePassword('');
            setErrorPassword('');
          }}>
            Cambiar Contraseña
          </Button>

          {rol === 'cliente' && (
            <>
              <hr />
              <Button variant="danger" onClick={() => {
                setShowModalEliminar(true);
                setMensajeEliminar('');
                setErrorEliminar('');
              }}>
                Eliminar Cuenta
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      <Modal show={showModalPassword} onHide={() => setShowModalPassword(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="passwordActual">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="nuevaPassword">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />
              <Form.Text className="text-muted">
                Mínimo 5 caracteres, una mayúscula y un número.
              </Form.Text>
            </Form.Group>
          </Form>
          {mensajePassword && <Alert variant="success">{mensajePassword}</Alert>}
          {errorPassword && <Alert variant="danger">{errorPassword}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalPassword(false)}>Cancelar</Button>
          <Button variant="warning" onClick={handleCambiarPassword}>Cambiar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Eliminar Cuenta */}
      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Cuenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para eliminar tu cuenta, por favor ingresa tu contraseña:</p>
          <Form>
            <Form.Group controlId="passwordEliminar">
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={passwordEliminar}
                onChange={(e) => setPasswordEliminar(e.target.value)}
              />
            </Form.Group>
          </Form>
          {mensajeEliminar && <Alert variant="success" className="mt-2">{mensajeEliminar}</Alert>}
          {errorEliminar && <Alert variant="danger" className="mt-2">{errorEliminar}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminarCuenta}>Eliminar Cuenta</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MisDatos;
