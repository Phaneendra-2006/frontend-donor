import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabels = {
    DONOR: 'Food Donor',
    NGO: 'Recipient Organization',
    ADMIN: 'Platform Admin',
    ANALYST: 'Data Analyst',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'DONOR':
        return '/donor';
      case 'NGO':
        return '/ngo';
      case 'ADMIN':
        return '/admin';
      case 'ANALYST':
        return '/analyst';
      default:
        return '/';
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to={getDashboardLink()} style={styles.logo}>
          <span style={styles.logoMark}>FD</span>
          <span>Food Donation System</span>
        </Link>
        
        <div style={styles.navLinks}>
          {user && (
            <>
              <Link to={getDashboardLink()} style={styles.link}>
                Dashboard
              </Link>
              <Link to="/profile" style={styles.link}>
                Profile
              </Link>
              <span style={styles.userInfo}>
                {user.name} ({roleLabels[user.role] || user.role})
              </span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: 'rgba(6, 17, 31, 0.82)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: '800',
    color: 'white',
    textDecoration: 'none',
    letterSpacing: '-0.2px',
  },
  logoMark: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #34d399 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '900',
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.35)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    color: 'rgba(255,255,255,0.88)',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    padding: '10px 14px',
    borderRadius: '999px',
    transition: 'background 0.2s ease, color 0.2s ease',
  },
  userInfo: {
    color: 'white',
    fontSize: '14px',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  logoutButton: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    color: '#0f172a',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.15)',
  },
};

export default Navbar;
