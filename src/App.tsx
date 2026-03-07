import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import MainDashboard from './pages/MainDashboard';
import SpaceDashboard from './pages/SpaceDashboard';
import MapDashboard from './pages/MapDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AlertsDashboard from './pages/AlertsDashboard';
import SettingsDashboard from './pages/SettingsDashboard';
import LoginDashboard from './pages/LoginDashboard';
import { EnvProvider } from './context/EnvContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <EnvProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<MainDashboard />} />
              <Route path="map" element={<MapDashboard />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="space" element={<SpaceDashboard />} />
              <Route path="alerts" element={<AlertsDashboard />} />
              <Route path="settings" element={<SettingsDashboard />} />
              <Route path="login" element={<LoginDashboard />} />
            </Route>
          </Routes>
        </Router>
        </EnvProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
