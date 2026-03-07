import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import LoginDashboard from '../../pages/LoginDashboard';
import './Layout.css';

const DashboardLayout = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
     return <div className="app-container" style={{ background: 'var(--bg-dark)' }} />;
  }

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <div 
         className="dashboard-content-wrapper fade-in" 
         style={{ 
           display: 'flex', width: '100%', height: '100%',
           pointerEvents: !currentUser ? 'none' : 'auto', 
           filter: !currentUser ? 'blur(12px) brightness(0.5)' : 'none', 
           transition: 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)', 
         }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          />
        )}
        <div className="main-content">
          <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>

      {!currentUser && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginDashboard />
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
