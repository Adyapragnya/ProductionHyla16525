import React, { useEffect, useState, useRef } from 'react';
import './HylaAnalitics.css';

const HylaAnalitics = () => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  // Helper function to retrieve the JWT token.
  const getToken = () => {
    return localStorage.getItem('jwtToken') || '123';
  };

  useEffect(() => {
    const fetchEmbedUrl = async () => {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      try {
        const response = await fetch(`${baseURL}/api/generate-embed-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            dashboardId: 3,
            // Adding default credentials directly in the request body:
            username: 'Hyla',
            password: 'Hyla@APTPL'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch embed URL.');
        }

        const data = await response.json();
        setEmbedUrl(data.url);
      } catch (err) {
        console.error('Error fetching embed URL:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbedUrl();
  }, []);

  const handleFullScreen = () => {
    if (cardRef.current) {
      // If already in full screen, exit; otherwise request full screen for the card element.
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        cardRef.current.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable full-screen mode:", err);
        });
      }
    }
  };

  const loader = (
    <>
      {/* Keyframes for the bouncing dots animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
            width: '18px',
            height: '18px',
            margin: '3px',
            backgroundColor: '#4d34db',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out'
          }}
        />
        <div style={{
            width: '18px',
            height: '18px',
            margin: '3px',
            backgroundColor: '#4d34db',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.2s'
          }}
        />
        <div style={{
            width: '18px',
            height: '18px',
            margin: '3px',
            backgroundColor: '#4d34db',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.4s'
          }}
        />
      </div>
    </>
  );

  return (
    <div className="card" ref={cardRef}>
      <div className="card-header" style={{ textAlign: 'center', fontSize: '30px', position: 'relative' }}>
        Hyla Analytics Dashboard
        <button
  onClick={handleFullScreen}
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '40px',
    height: '40px',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    marginRight:"10px"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  }}

>
  <i className='fa-solid fa-maximize' style={{ color: "#0F67B1", fontSize: '18px' }}></i>
  <span className="tooltip">Fullscreen</span>
</button>

<style>
  {`
    .tooltip {
      visibility: hidden;
      background-color:rgb(24, 56, 82);
      color: white;
      text-align: center;
      padding: 6px 8px;
      border-radius: 4px;
      position: absolute;
      top: 110%;
      right: 50%;
      transform: translateX(50%);
      white-space: nowrap;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    button:hover .tooltip {
      visibility: visible;
      opacity: 1;
    }
  `}
</style>

      </div>
      <div
        className="card-body"
        style={{
          minHeight: '800px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {loading && loader}
        {error && <div style={{ textAlign: 'center' }}>Error: {error}</div>}
        {!loading && !error && (
          <iframe
            src={embedUrl}
            title="Embedded Superset Dashboard"
            width="100%"
            height="800px"
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

export default HylaAnalitics;
