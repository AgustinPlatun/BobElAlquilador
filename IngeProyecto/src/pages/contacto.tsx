import React from 'react';
import Navbar from '../Components/NavBar/Navbar';
import Footer from '../Components/Footer/Footer';

const Contacto: React.FC = () => {
  return (
    <div className="full-page-layout">
      <Navbar />
      <div className="main-content-centered">
        <div className="card shadow" style={{ maxWidth: 450, width: '100%' }}>
          <div className="card-body">
            <h2 className="card-title mb-4 text-center">Contacto</h2>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item">
                📍 <strong>Dirección:</strong> Carlos Pelegrini 123, Buenos Aires
              </li>
              <li className="list-group-item">
                📞 <strong>Teléfono:</strong> (011) 1234-5678
              </li>
              <li className="list-group-item">
                ✉️ <strong>Email:</strong> bobelalquilador@gmail.com
              </li>
              <li className="list-group-item">
                🕒 <strong>Horario:</strong> Lunes a Viernes de 8 a 18 hs
              </li>
            </ul>
            <div className="text-center">
              <span className="text-secondary">
                ¡No dudes en comunicarte con nosotros para cualquier consulta o presupuesto!
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contacto;