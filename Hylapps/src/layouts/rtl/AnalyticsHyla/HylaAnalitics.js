import React, { useEffect, useState } from 'react';
import './HylaAnalitics.css';

const HylaAnalitics = () => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to retrieve the JWT token.
  // You might want to update this logic later once you handle login with username/password.
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
    <div className="card">
      <div className="card-header" style={{ textAlign: 'center', fontSize: '30px' }}>
        Hyla Analytics Dashboard
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
