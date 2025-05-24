import { Link } from 'react-router-dom';
import { MenuOption } from './Types';

type Props = {
  usuario: string;
  menuOptions: MenuOption[];
  isMobile?: boolean;
};

const UserDropdown = ({ usuario, menuOptions, isMobile = false }: Props) => {
  const dropdownId = isMobile ? 'mobileUserDropdown' : 'desktopUserDropdown';
  const className = isMobile
    ? 'btn btn-outline-light rounded-circle dropdown-toggle'
    : 'btn btn-outline-light dropdown-toggle fw-bold text-uppercase';

  return (
    <div className="dropdown">
      <button
        className={className}
        type="button"
        id={dropdownId}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={isMobile ? { width: '50px', height: '50px', padding: 0, fontSize: '1.2rem', marginRight: '10px'} : {}}
      >
        {isMobile ? '👤' : usuario}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={dropdownId}>
        {menuOptions.map((option, index) =>
          option.path ? (
            <li key={index}>
              <Link className="dropdown-item" to={option.path}>
                {option.label}
              </Link>
            </li>
          ) : (
            <li key={index}>
              <button className="dropdown-item" onClick={option.action}>
                {option.label}
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default UserDropdown;
