import { useEnv } from '../../context/EnvContext';
import { HeartPulse, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import './HealthAdvisory.css';

const HealthAdvisory = () => {
  const { aqi, loading } = useEnv();

  if (loading || !aqi) return null;

  const currentAQI = aqi.current.us_aqi;

  let riskLevel = 'Low Risk';
  let icon = <CheckCircle className="text-accent-success" size={24} />;
  let colorClass = 'success';
  let advices = [
    'Perfect day for outdoor exercise.',
    'Enjoy normal outdoor activities.',
    'Ventilate your home directly.'
  ];

  if (currentAQI > 50 && currentAQI <= 100) {
    riskLevel = 'Moderate Risk';
    icon = <AlertTriangle className="text-accent-warning" size={24} />;
    colorClass = 'warning';
    advices = [
      'Unusually sensitive individuals should limit heavy exertion.',
      'Acceptable air quality for most people.',
      'Close windows if you live near busy roads.'
    ];
  } else if (currentAQI > 100 && currentAQI <= 150) {
    riskLevel = 'High Risk';
    icon = <AlertTriangle className="text-accent-danger" size={24} />;
    colorClass = 'danger';
    advices = [
      'Sensitive groups should stay indoors.',
      'Wear a protective N95 mask outdoors.',
      'Reduce prolonged or heavy outdoor exertion.'
    ];
  } else if (currentAQI > 150) {
    riskLevel = 'Severe Risk';
    icon = <ShieldAlert className="text-accent-danger" size={24} />;
    colorClass = 'severe';
    advices = [
      'Everyone should avoid outdoor activities.',
      'Keep all windows and doors closed.',
      'Run an air purifier indoors.'
    ];
  }

  return (
    <div className={`glass-panel health-advisory-container ${colorClass} span-2`}>
      <div className="health-header">
        <HeartPulse size={20} className="header-icon" />
        <div>
          <h3>Health & Safety Advisory</h3>
          <span className="risk-badge">
            {icon}
            {riskLevel}
          </span>
        </div>
      </div>

      <div className="recommendations">
        <h4>Outdoor Safety Recommendations:</h4>
        <ul>
          {advices.map((advice, idx) => (
            <li key={idx}>{advice}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HealthAdvisory;
