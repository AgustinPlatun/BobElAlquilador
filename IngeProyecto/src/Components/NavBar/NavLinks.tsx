import { Link } from 'react-router-dom';

const links = [
  { label: 'Inicio', path: '/' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Contacto', path: '/contacto' }
];

const NavLinks = () => (
  <>
    {/* Desktop */}
    {links.map((link, i) => (
      <li key={i} className="nav-item d-none d-lg-block" style={{ width: '110px', textAlign: 'center' }}>
        <Link className="nav-link fs-5 fw-semibold text-dark link-light mx-1 rounded" to={link.path}>
          {link.label}
        </Link>
      </li>
    ))}
    {/* Mobile */}
    {links.map((link, i) => (
      <li key={`m-${i}`} className="nav-item d-block d-lg-none text-center">
        <Link className="nav-link fs-5 fw-semibold text-dark link-light mx-1 rounded" to={link.path}>
          {link.label}
        </Link>
      </li>
    ))}
  </>
);

export default NavLinks;
