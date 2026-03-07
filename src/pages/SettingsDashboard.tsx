import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Bell, Wind, Thermometer, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SettingsDashboard = () => {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem('eco_theme') || 'dark');
  const [units, setUnits] = useState(localStorage.getItem('eco_units') || 'metric');
  const [notifications, setNotifications] = useState(localStorage.getItem('eco_notif') === 'true');

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('eco_theme', theme);
    localStorage.setItem('eco_units', units);
    localStorage.setItem('eco_notif', notifications.toString());
    
    // Apply theme to document (requires global CSS support)
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme, units, notifications]);

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Settings size={28} /> {t('systemSettings')}
          </h1>
          <p className="subtitle">Configure application defaults, units, and API preferences.</p>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr)', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Appearance Settings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
             <Moon size={20} className="text-accent-primary" /> {t('appearance')}
           </h2>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
             <div>
               <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Color Theme</h4>
               <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Switch between Dark and Light mode</p>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                <button 
                  onClick={() => setTheme('dark')}
                  style={{ padding: '0.5rem 1rem', background: theme === 'dark' ? 'var(--accent-primary)' : 'transparent', color: theme === 'dark' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <Moon size={16} /> Dark
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  style={{ padding: '0.5rem 1rem', background: theme === 'light' ? 'var(--accent-primary)' : 'transparent', color: theme === 'light' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <Sun size={16} /> Light
                </button>
             </div>
           </div>
        </div>

        {/* Measurement Units */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
             <Thermometer size={20} className="text-accent-warning" /> {t('units')}
           </h2>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
             <div>
               <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Temperature & Speed</h4>
               <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Metric (°C, km/h) vs Imperial (°F, mph)</p>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                <button 
                  onClick={() => setUnits('metric')}
                  style={{ padding: '0.5rem 1rem', background: units === 'metric' ? 'var(--accent-warning)' : 'transparent', color: units === 'metric' ? '#000' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  Metric
                </button>
                <button 
                  onClick={() => setUnits('imperial')}
                  style={{ padding: '0.5rem 1rem', background: units === 'imperial' ? 'var(--accent-warning)' : 'transparent', color: units === 'imperial' ? '#000' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  Imperial
                </button>
             </div>
           </div>
        </div>

        {/* Alerts & Privacy */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
             <Shield size={20} className="text-accent-danger" /> {t('alertsPrivacy')}
           </h2>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
             <div>
               <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Emergency Disaster Alerts</h4>
               <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receive desktop notifications for high AQI and Earthquakes</p>
             </div>
             <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-danger)' }}
                />
             </label>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsDashboard;
