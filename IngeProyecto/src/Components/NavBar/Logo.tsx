import { Link } from 'react-router-dom';

const Logo = ({ isLargeScreen }: { isLargeScreen: boolean }) => (
  <div
    className="d-flex align-items-center"
    style={{
      flex: '0 0 auto',
      minWidth: isLargeScreen ? '260px' : undefined
    }}
  >
    <Link className="navbar-brand d-flex align-items-center" to="/">
      <img src="/images/Completo.png" alt="Logo" style={{ height: '50px' }} />
    </Link>
  </div>
);

export default Logo;
