import { Calendar, Moon, Star, Eclipse, Sparkles } from 'lucide-react';
import { useState } from 'react';
import './SkyEvents.css';

// Using mock data for sky events because reliable free APIs for this are severely rate-limited or unavailable.
const dailyEvents = [
  {
    id: 'd1',
    title: 'ISS Overhead Pass',
    date: 'Tonight, 8:43 PM',
    description: 'Visible for 4 minutes. Max elevation 65°.',
    type: 'satellite',
    icon: <Sparkles size={20} className="text-secondary" />
  },
  {
    id: 'd2',
    title: 'Venus Conjuction',
    date: 'Tomorrow, 5:12 AM',
    description: 'Venus visible very clearly before sunrise.',
    type: 'planet',
    icon: <Star size={20} className="text-accent-warning" />
  }
];

const monthlyEvents = [
  {
    id: 1,
    title: 'Lyrids Meteor Shower',
    date: 'April 22-23',
    description: 'Up to 20 meteors per hour at its peak.',
    type: 'meteor',
    icon: <Sparkles size={20} className="text-accent-info" />
  },
  {
    id: 2,
    title: 'Full Pink Moon',
    date: 'April 23',
    description: 'The moon will be located on the opposite side of the Earth as the Sun.',
    type: 'moon',
    icon: <Moon size={20} className="text-secondary" />
  },
  {
    id: 3,
    title: 'Eta Aquarids Meteor Shower',
    date: 'May 6-7',
    description: 'Produced by dust particles left behind by comet Halley.',
    type: 'meteor',
    icon: <Star size={20} className="text-accent-warning" />
  },
  {
    id: 4,
    title: 'Total Solar Eclipse',
    date: 'August 12',
    description: 'A spectacular total eclipse visible across northern hemisphere passes.',
    type: 'eclipse',
    icon: <Eclipse size={20} className="text-accent-danger" />
  }
];

const annualEvents = [
  {
    id: 'a1',
    title: 'Total Solar Eclipse',
    date: 'August 12',
    description: 'A spectacular total eclipse visible across northern hemisphere passes.',
    type: 'eclipse',
    icon: <Eclipse size={20} className="text-accent-danger" />
  },
  {
    id: 'a2',
    title: 'Perseid Meteor Shower',
    date: 'Aug 11-13',
    description: 'One of the best meteor showers, producing up to 60 meteors per hour.',
    type: 'meteor',
    icon: <Sparkles size={20} className="text-accent-info" />
  },
  {
    id: 'a3',
    title: 'Geminids',
    date: 'Dec 13-14',
    description: 'The king of meteor showers, up to 120 multicolored meteors per hour.',
    type: 'meteor',
    icon: <Star size={20} className="text-accent-warning" />
  }
];

const SkyEvents = () => {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'monthly' | 'annual'>('monthly');
  const [subscribed, setSubscribed] = useState<Record<string|number, boolean>>({});
  
  const displayedEvents = timeFilter === 'daily' ? dailyEvents : (timeFilter === 'annual' ? annualEvents : monthlyEvents);

  const toggleNotify = (id: string | number) => {
    setSubscribed(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <div className="glass-panel events-container span-2">
      <div className="widget-header">
        <div className="header-title">
          <Calendar size={18} className="text-secondary" />
          <h3>Sky Observations & Events</h3>
        </div>
        <div className="time-filter">
          <span className={timeFilter === 'daily' ? 'active' : ''} onClick={() => setTimeFilter('daily')}>Daily</span>
          <span className={timeFilter === 'monthly' ? 'active' : ''} onClick={() => setTimeFilter('monthly')}>Monthly</span>
          <span className={timeFilter === 'annual' ? 'active' : ''} onClick={() => setTimeFilter('annual')}>Annual</span>
        </div>
      </div>
      
      <div className="events-list">
        {displayedEvents.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-icon-wrapper">
              {event.icon}
            </div>
            <div className="event-details">
              <h4>{event.title}</h4>
              <span className="event-date">{event.date}</span>
              <p>{event.description}</p>
            </div>
            <button 
              className={`notify-btn ${subscribed[event.id] ? 'subscribed' : ''}`}
              onClick={() => toggleNotify(event.id)}
            >
               {subscribed[event.id] ? 'Subscribed ✓' : 'Notify Me'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkyEvents;
