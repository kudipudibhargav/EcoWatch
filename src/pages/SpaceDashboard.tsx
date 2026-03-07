import ISSTracker from '../components/space/ISSTracker';
import SkyEvents from '../components/space/SkyEvents';

const SpaceDashboard = () => {
  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient-purple" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             Space & Astronomical Monitor
          </h1>
          <p className="subtitle">Real-time satellite tracking and sky observation guides</p>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <ISSTracker />
        <SkyEvents />
      </div>
    </div>
  );
};

export default SpaceDashboard;
