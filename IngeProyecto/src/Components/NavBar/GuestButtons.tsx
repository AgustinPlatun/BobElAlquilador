import { useNavigate } from 'react-router-dom';

const GuestButtons = ({ isMobile }: { isMobile: boolean }) => {
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <div className="d-flex flex-column gap-2 ms-1">
        <button className="btn btn-outline-light btn-sm mt-2 me-2" onClick={() => navigate('/login')}>
          Iniciar sesión
        </button>
        <button className="btn btn-light text-danger btn-sm mb-2 me-2" onClick={() => navigate('/register')}>
          Registrarse
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="btn btn-outline-light me-2" onClick={() => navigate('/login')}>
        Iniciar sesión
      </button>
      <button className="btn btn-light text-danger me-2" onClick={() => navigate('/register')}>
        Registrarse
      </button>
    </>
  );
};

export default GuestButtons;
