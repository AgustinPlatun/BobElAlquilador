import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-2 mt-4">
      <div className="container">
        <div className="text-center">
          <p className="mb-0" style={{ fontSize: '0.75rem' }}>
            © 2025 Bob el Alquilador. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
