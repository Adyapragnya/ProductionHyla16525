/* eslint-disable react/prop-types */
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MyMapComponent.css';
import './Popup.css';

// Utility: create a custom icon for vessels
export const createCustomIcon = (heading, width, height, iconType) => {
  if (iconType === 'point') {
    return L.divIcon({
      className: 'custom-icon blinking-icon',
      html: `<div style="width: ${width}px; height: ${height}px; background-color: red; border-radius: 50%;" role="img" aria-label="Vessel marker"></div>`,
      iconSize: [width, height],
    });
  }
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg); width: ${width}px; height: ${height}px;">
             <img src="/ship-popup.png" alt="Ship icon" style="width: 100%; height: 100%;" />
           </div>`,
    iconSize: [width, height],
  });
};

// Utility: calculate icon size based on zoom level and selection state
export const getIconForZoom = (zoom, isSelected) => {
  const sizeMultiplier = isSelected ? 1.5 : 1;
  if (zoom > 23) return { width: 35 * sizeMultiplier, height: 60 * sizeMultiplier, type: 'extra-large' };
  if (zoom > 15) return { width: 25 * sizeMultiplier, height: 50 * sizeMultiplier, type: 'large' };
  if (zoom > 14.75) return { width: 19 * sizeMultiplier, height: 45 * sizeMultiplier, type: 'medium' };
  if (zoom > 13.75) return { width: 15 * sizeMultiplier, height: 35 * sizeMultiplier, type: 'small' };
  if (zoom > 12.75) return { width: 15 * sizeMultiplier, height: 30 * sizeMultiplier, type: 'small' };
  if (zoom > 11.5) return { width: 10 * sizeMultiplier, height: 25 * sizeMultiplier, type: 'small' };
  if (zoom > 10.75) return { width: 10 * sizeMultiplier, height: 20 * sizeMultiplier, type: 'small' };
  if (zoom > 9.75) return { width: 10 * sizeMultiplier, height: 15 * sizeMultiplier, type: 'small' };
  if (zoom > 8.75) return { width: 7 * sizeMultiplier, height: 10 * sizeMultiplier, type: 'small' };
  if (zoom > 7.75) return { width: 7 * sizeMultiplier, height: 7 * sizeMultiplier, type: 'point' };
  if (zoom > 6) return { width: 7 * sizeMultiplier, height: 7 * sizeMultiplier, type: 'point' };
  return { width: 6 * sizeMultiplier, height: 6 * sizeMultiplier, type: 'point' };
};

// VesselInfo Component: displays voyage details in a table
const VesselInfo = ({ vessel }) => (
  <div className="vessel-info" role="region" aria-labelledby="vessel-info-heading">
    <table className="voyage-table">
      <thead>
        <tr>
          <th id="vessel-info-heading" colSpan="2" style={{color:" #0F67B1", fontSize:"20px"}}>Voyage Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Departure Port:</td>
          <td>{vessel.AIS.DESTINATION || 'N/A'}</td>
        </tr>
        <tr>
          <td>Arrival Port:</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Arrival Date:</td>
          <td>{vessel.AIS.ETA || 'N/A'}</td>
        </tr>
        <tr>
          <td>Actual Arrival Date:</td>
          <td>{vessel.AIS.ETA || 'N/A'}</td>
        </tr>
        <tr>
          <td>Voyage Duration:</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Cargo Type:</td>
          <td>{vessel.SpireTransportType || 'N/A'}</td>
        </tr>
        <tr>
          <td>Quantity:</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Unit:</td>
          <td>N/A</td>
        </tr>
      </tbody>
    </table>
  </div>
);

VesselInfo.propTypes = {
  vessel: PropTypes.shape({
    AIS: PropTypes.shape({
      DESTINATION: PropTypes.string,
      ETA: PropTypes.string,
    }),
  }).isRequired,
};

// VesselPopup Component: displays detailed information in the marker popup
const VesselPopup = ({ vessel }) => (
  <div className="popup-container" role="dialog" aria-modal="true">
    <div className="popup-header">
      <h3 className="popup-title">
        {vessel.AIS.NAME || '-'}{' '}
        <span className="popup-imo">{vessel.AIS.IMO || '-'}</span>
      </h3>
    </div>
    <div className="popup-details">
      <div className="popup-detail">
        <strong>TYPE :</strong>
        <span className="popup-value">
          {vessel.SpireTransportType || '-'}
        </span>
      </div>
      <div className="popup-detail">
        <span className="popup-value">
          {vessel.AIS.HEADING ? `${vessel.AIS.HEADING}°` : '-'} |{' '}
          {vessel.AIS.SPEED ? `${vessel.AIS.SPEED} kn` : '-'}
        </span>
      </div>
      <div className="popup-detail">
        <strong>DESTN :</strong>
        <span className="popup-value">
          {vessel.AIS.DESTINATION || '-'}
        </span>
      </div>
      <div className="popup-detail">
        <strong>ETA :</strong>
        <span className="popup-value">
          {vessel.AIS.ETA || '-'}
        </span>
      </div>
    </div>
  </div>
);

VesselPopup.propTypes = {
  vessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    AIS: PropTypes.shape({
      NAME: PropTypes.string,
      IMO: PropTypes.string,
      SPEED: PropTypes.number,
      DESTINATION: PropTypes.string,
      HEADING: PropTypes.number,
      ETA: PropTypes.string,
    }),
  }).isRequired,
};

// Main MyMapComponent
const MyMapComponent = ({ selectedVessel, style }) => {
  const mapRef = useRef(null);
  const [vessels, setVessels] = useState([]);
  const [iconSize, setIconSize] = useState(getIconForZoom(5, !!selectedVessel));
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch vessel data from API with proper error handling and fallback UI
  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        setVessels(response.data);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching vessel data:', err);
        setFetchError('Failed to load vessel data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchVessels();
  }, []);

  // Update icon size when zoom level changes, using a memoized callback
  const updateIconSize = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const currentZoom = map.getZoom();
      setIconSize(getIconForZoom(currentZoom, !!selectedVessel));
    }
  }, [selectedVessel]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      updateIconSize();
      map.on('zoomend', updateIconSize);
      return () => map.off('zoomend', updateIconSize);
    }
  }, [updateIconSize]);

  // Fly to selected vessel position on change
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getContainer()) {
      if (selectedVessel?.AIS?.LATITUDE && selectedVessel?.AIS?.LONGITUDE) {
        map.flyTo(
          [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE],
          4,
          { duration: 1 }
        );
      } else {
        map.setView([0, 0], 2);
      }
    }
  }, [selectedVessel]);

  // Memoize the rendered Marker to avoid unnecessary re-renders
  const renderedMarker = useMemo(() => {
    if (!selectedVessel) return null;
    return (
      <Marker
        position={[selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE]}
        icon={createCustomIcon(
          selectedVessel.AIS.HEADING,
          iconSize.width,
          iconSize.height,
          iconSize.type
        )}
        eventHandlers={{
          click: (e) => {
            const map = mapRef.current;
            if (map && map.getContainer()) {
              map.flyTo(
                [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE],
                7,
                { duration: 1 }
              );
              e.target.openPopup();
            }
          },
        }}
      >
        <Popup>
          <VesselPopup vessel={selectedVessel} />
        </Popup>
      </Marker>
    );
  }, [selectedVessel, iconSize]);

  // Ensure the map properly resizes when its container changes
  useEffect(() => {
    const mapContainer = document.querySelector('.map-container');
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    if (mapContainer) {
      resizeObserver.observe(mapContainer);
    }
    const handleWindowResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 200);
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      if (mapContainer) {
        resizeObserver.unobserve(mapContainer);
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Extra effect to force a size invalidation after mount
  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 500);
  }, []);

  return (
    <div className="map-component-wrapper" style={style}>
      {selectedVessel && <VesselInfo vessel={selectedVessel} />}
      <div className="map-container" role="application" aria-label="Map showing vessel positions">
        {loading ? (
          <div className="loading" role="status" aria-live="polite">
            Loading vessel data...
          </div>
        ) : fetchError ? (
          <div className="error" role="alert">
            {fetchError}
          </div>
        ) : (
          <MapContainer
              center={[0, 0]}
              zoom={5}
              minZoom={1.5}
              maxZoom={15}
              maxBounds={[[90, -180], [-90, 180]]}
              maxBoundsViscosity={8}
              whenCreated={(map) => (mapRef.current = map)}
              style={{ width: '100%', height: '100%', backgroundColor: 'rgba(170,211,223,1)' }} // This relies on the parent .map-container height
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap />
              {renderedMarker}
            </MapContainer>

        )}
      </div>
    </div>
  );
};

MyMapComponent.propTypes = {
  selectedVessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    AIS: PropTypes.shape({
      NAME: PropTypes.string,
      IMO: PropTypes.string,
      CALLSIGN: PropTypes.string,
      SPEED: PropTypes.number,
      DESTINATION: PropTypes.string,
      LATITUDE: PropTypes.number,
      LONGITUDE: PropTypes.number,
      HEADING: PropTypes.number,
      ETA: PropTypes.string,
    }),
  }),
  style: PropTypes.object,
};

export default MyMapComponent;