import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Timeline.css';

const SimpleTimeline = ({ initialEvents, selectedVessel }) => {
  const [events, setEvents] = useState(initialEvents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Auto-scroll to the active event
  useEffect(() => {
    const container = containerRef.current;
    const active = container?.querySelector('.simple-timeline-item.active');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentIndex]);

  // Fetch vessel history when vessel changes
  useEffect(() => {
    if (!selectedVessel) return;

    const fetchVesselHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-vessel-histories`);
        const filtered = response.data.filter(
          (v) => v.vesselName === selectedVessel.AIS.NAME
        );
        const last = filtered.length ? filtered[filtered.length - 1] : null;
        if (last?.history) {
          const formatted = last.history
            .filter((e) => e.geofenceFlag === 'Inside')
            .map((e, i) => ({
              id: e._id?.$oid || `event-${i}`,
              name: e.geofenceName || 'Unnamed Geofence',
              entry: e.entryTime,
              exit: e.exitTime,
            }));
          setEvents(formatted);
          setCurrentIndex(0);
        } else {
          setEvents([]);
        }
      } catch (e) {
        console.error('Error fetching vessel history:', e);
        setError('Failed to load history.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVesselHistory();
  }, [selectedVessel]);

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const formatDateTime = (dateStr) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(dateStr));
    } catch {
      return dateStr || '-';
    }
  };

  return (
    <div className="simple-timeline-container">
      <div className="simple-timeline-controls">
        <button onClick={prevEvent} disabled={!events.length} aria-label="Previous Event">
          &lt;
        </button>
        <button onClick={nextEvent} disabled={!events.length} aria-label="Next Event">
          &gt;
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading vessel history...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="simple-timeline" ref={containerRef}>
          {events.length > 0 ? (
            events.map((event, index) => (
              <div
                key={event.id}
                className={`simple-timeline-item ${
                  index === currentIndex ? 'active' : ''
                }`}
                tabIndex={0}
              >
                <div className="event-marker"></div>
                <div className="event-details">
                  <h4>{event.name}</h4>
                  <p>Entry: {formatDateTime(event.entry)}</p>
                  {event.exit && <p>Exit: {formatDateTime(event.exit)}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="no-events">No events available.</p>
          )}
        </div>
      )}
    </div>
  );
};

SimpleTimeline.propTypes = {
  selectedVessel: PropTypes.shape({
    AIS: PropTypes.shape({
      NAME: PropTypes.string.isRequired,
    }).isRequired,
  }),
  initialEvents: PropTypes.array,
};

SimpleTimeline.defaultProps = {
  initialEvents: [],
};

export default SimpleTimeline;
