import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Map as MapIcon, 
  BarChart2, 
  Settings, 
  Rocket, 
  Wind,
  ShieldAlert,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: <Home size={20} />, translationKey: 'dashboard' },
  { path: '/map', icon: <MapIcon size={20} />, translationKey: 'geoExplorer' },
  { path: '/analytics', icon: <BarChart2 size={20} />, translationKey: 'analytics' },
  { path: '/space', icon: <Rocket size={20} />, translationKey: 'spaceMonitor' },
  { path: '/alerts', icon: <ShieldAlert size={20} />, translationKey: 'alerts' },
  { path: '/settings', icon: <Settings size={20} />, translationKey: 'settings' },
];

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const handleProfileClick = () => {
    if (currentUser) {
      if (window.confirm("Do you want to sign out?")) {
        logout();
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <aside className={`sidebar glass-panel${isOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <Wind className="brand-icon" size={28} />
        <h2>EcoWatch</h2>
        {/* Close button visible only on mobile when sidebar is open */}
        {isOpen && (
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
            ✕
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{t(item.translationKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div 
          className="user-profile" 
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
          title={currentUser ? "Click to Sign Out" : "Click to Login"}
        >
          <div className="avatar">
            {currentUser?.photoURL ? (
               <img src={currentUser.photoURL} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
               <User size={18} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
               {currentUser ? (currentUser.displayName || t('ecoUser')) : t('guestUser')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
