import React, { useEffect, useState } from 'react';
import Navbar from './Components/NavBar/Navbar';
import { useLocation } from 'react-router-dom';

const App: React.FC = () => {
  const location = useLocation();
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');

    if (status === 'success') {
      setMensaje('✅ Alquiler efectuado con éxito');
    } else if (status === 'failure') {
      setMensaje('❌ El pago fue rechazado');
    } else if (status === 'pending') {
      setMensaje('⏳ El pago está pendiente de aprobación');
    }
  }, [location.search]);

  return (
    <div>
      <Navbar />
      {mensaje && (
        <div className="alert alert-info text-center fw-bold" role="alert">
          {mensaje}
        </div>
      )}
      <main className="container py-4 px-4">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0 text-center">
            <video
              src="/video/Bob_el_Alquilador_-_New_York.mp4"
              controls
              autoPlay
              loop
              muted
              style={{ width: '320px', height: '400px', borderRadius: '12px', objectFit: 'cover' }}
            >
              Tu navegador no soporta el video.
            </video>
          </div>
          <div className="col-md-6 text-start">
            <h2 className="mb-3 fw-bold">Bienvenidos a Bob el Alquilador</h2>
            <p>
              Con más de 2 decadas de experiencia en el rubro, en Bob el Alquilador nos especializamos en el alquiler de maquinarias para obras, construcciones y todo tipo de proyectos. Ponemos a tu disposición una flota de equipos modernos y en excelentes condiciones, listos para acompañarte en cada desafío.
            </p>
            <p>
              Nuestro compromiso es ofrecerte un servicio confiable, rápido y personalizado, con el respaldo de un equipo técnico capacitado y siempre dispuesto a asesorarte.
            </p>
            <p className="fw-bold">
              🚧 Tu proyecto empieza con las herramientas correctas.<br />
              En Bob el Alquilador, te ayudamos a dar el primer paso.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
