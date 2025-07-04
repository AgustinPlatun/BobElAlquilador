import React, { useEffect, useState } from 'react';
import Navbar from './Components/NavBar/Navbar';
import Footer from './Components/Footer/Footer';
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
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />
      {mensaje && (
        <div className="alert alert-info text-center fw-bold" role="alert" style={{ marginBottom: 0 }}>
          {mensaje}
        </div>
      )}
      <main className="container py-5 px-4">
        <div className="row align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
          {/* Contenedor del video más pequeño */}
          <div className="col-md-4 mb-md-0 text-center">
            <div
              style={{
                borderRadius: "18px",
                display: "inline-block"
              }}
            >
              <video
                src="/video/Bob_el_Alquilador_-_New_York.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '90%',
                  maxWidth: '90%',
                  height: '90%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)"
                }}
                tabIndex={-1}
                onContextMenu={e => e.preventDefault()}
              >
                Tu navegador no soporta el video.
              </video>
            </div>
          </div>
          {/* Contenedor del texto más grande */}
          <div className="col-md-8 text-start d-flex flex-column justify-content-center" style={{ minHeight: 400 }}>
            <h1 className="fw-bold mb-3" style={{ fontSize: '2.4rem', color: "#212529", letterSpacing: "-1px" ,marginRight: '5%',marginLeft: '5%'}}>
              Bienvenidos a <span style={{ color: "#198754" }}>Bob el Alquilador</span>
            </h1>
            <p className="text-muted mb-3" style={{ fontSize: '1.13rem', lineHeight: 1.7,marginRight: '5%',marginLeft: '5%' }}>
              Con más de <b>2 décadas de experiencia</b> en el rubro, en Bob el Alquilador nos especializamos en el alquiler de maquinarias para obras, construcciones y todo tipo de proyectos.<br />
              Ponemos a tu disposición una flota de equipos modernos y en excelentes condiciones, listos para acompañarte en cada desafío.
            </p>
            <p className="text-muted mb-3" style={{ fontSize: '1.13rem', lineHeight: 1.7,marginRight: '5%',marginLeft: '5%' }}>
              Nuestro compromiso es ofrecerte un servicio <b>confiable, rápido y personalizado</b>, con el respaldo de un equipo técnico capacitado y siempre dispuesto a asesorarte.
            </p>
            <div className="fw-bold" style={{ fontSize: "1.15rem", color: "#495057", background: "#e9f7ef", borderRadius: 8, padding: "0.8rem 1.2rem", display: "inline-block" ,marginRight: '5%',marginLeft: '5%'}}>
              🚧 Tu proyecto empieza con las herramientas correctas.<br />
              En Bob el Alquilador, te ayudamos a dar el primer paso.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
