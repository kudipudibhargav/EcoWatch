import { Menu, Search, MapPin, Mic, Volume2, Globe, Bell } from 'lucide-react';
import { useEnv } from '../../context/EnvContext';
import { useLanguage } from '../../context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { GeolocationData } from '../../types/api.types';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onMenuToggle }: { onMenuToggle?: () => void }) => {
  const { weather, aqi, location, searchLocation, setLocation } = useEnv();
  const { language, setLanguage, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeolocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);

    suggestionTimer.current = setTimeout(async () => {
      try {
        const results = await searchLocation(searchQuery);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (e) {
        console.error("Autocomplete failed:", e);
      }
    }, 400);
  }, [searchQuery, searchLocation]);

  const handleSelectSuggestion = (loc: GeolocationData) => {
    setLocation(loc);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearching(false);
  };

  const handleVoiceSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text to speech!");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const locName = location?.name || 'your location';
    const temp = weather ? Math.round(weather.current.temperature_2m) : 'unknown';
    const currentAqi = aqi ? aqi.current.us_aqi : 'unknown';
    const rainProb = weather ? weather.hourly.precipitation_probability[0] : 'unknown';

    const text = `Here is your environmental summary for ${locName}. The temperature is ${temp} degrees Celsius. The Air Quality Index is ${currentAqi}. There is a ${rainProb} percent chance of rain in the next hour.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      setIsSearching(true);
      try {
        const results = await searchLocation(searchQuery);
        if (results && results.length > 0) {
          handleSelectSuggestion(results[0]);
        } else {
          alert(`No results found for "${searchQuery}"`);
        }
      } catch {
        alert("Failed to search location.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
         async (position) => {
           try {
             const results = await searchLocation(`${position.coords.latitude},${position.coords.longitude}`);
             if (results && results.length > 0) {
               setLocation(results[0]);
             }
           } catch(e) {
             console.error("Reverse geocoding failed");
           }
         },
         () => {
           alert("Location access denied or unavailable.");
         }
      );
    }
  };

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <button className="mobile-menu-btn icon-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder={isSearching ? "Searching..." : t('searchPlaceholder')}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isSearching}
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass-panel">
              {suggestions.map((s, index) => (
                <div key={`${s.id}-${index}`} className="suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                  <MapPin size={16} className="text-accent-primary" />
                  <div className="suggestion-details">
                    <span className="suggestion-name">{s.name}</span>
                    <span className="suggestion-admin">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="location-badge" onClick={handleLocateMe} style={{cursor: 'pointer'}} title="Click to use current location">
          <MapPin size={16} className="text-accent-danger" />
          <span>{location ? `${location.name}, ${location.country_code}` : 'Loading...'}</span>
        </div>

        <div className="header-actions">
          <button 
            className={`icon-btn ${isSpeaking ? 'active-voice' : ''}`} 
            title="Voice Summary (English)"
            onClick={handleVoiceSummary}
          >
            {isSpeaking ? <Volume2 size={20} className="text-accent-success" /> : <Mic size={20} />}
          </button>
          <button 
            className="icon-btn" 
            title={t('language')} 
            onClick={() => setLanguage(language === 'en' ? 'hi' : (language === 'hi' ? 'te' : 'en'))}
          >
            <Globe size={20} />
            <span style={{ fontSize: '0.6rem', position: 'absolute', bottom: '2px', right: '4px', fontWeight: 'bold' }}>
               {language.toUpperCase()}
            </span>
          </button>
          <button className="icon-btn alert-active" title={t('alerts')} onClick={() => navigate('/alerts')}>
            <Bell size={20} />
            <span className="badge">!</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
