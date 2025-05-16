import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

const createCustomIcon = (heading, width, height, iconType) => {
  let iconUrl;

  switch (iconType) {
    case 'small':
      iconUrl = '/anchor-icon.png';
      break;
    case 'medium':
      iconUrl = '/anchor-icon.png';
      break;
    case 'large':
      iconUrl = '/anchor-icon.png';
      break;
    case 'extra-large':
      iconUrl = '/anchor-icon.png';
      break;
    default:
      iconUrl = '/anchor-icon.png';
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg); width: ${width}px; height: ${height}px;">
             <img src="${iconUrl}" style="width: 100%; height: 100%;" />
           </div>`,
    iconSize: [width, height],
  });
};


const createPointIcon = () => {
    return L.icon({
      iconUrl: '/anchor-icon.png', // Path to your anchor icon
      iconSize: [10, 10], // Increase size (Default: 40x40)
      iconAnchor: [10 / 2, 10 / 2], // Centers the icon
      popupAnchor: [0, -10 / 2], // Adjusts popup position
    });
  };
  
  




const getIconForZoom = (zoom) => {
    if (zoom > 4) return { width: 8, height: 8, type: 'point' };
    return { width: 6, height: 6, type: 'point' };
  };



const MapWithPorts = ({ ports,selectedPort }) => {
    console.log(ports);
  const map = useMap();
//   const markerClusterGroupRef = useRef(null);
  const markersRef = useRef({});
  const prevPortsRef = useRef([]);
//   const prevSelectedVesselRef = useRef(null);

const updateIconsForZoom = useCallback(() => {
    if (!map) return;
    const currentZoom = map.getZoom();
    const { width, height } = getIconForZoom(currentZoom);

    Object.values(markersRef.current).forEach((marker) => {
      const newIcon = createPointIcon();
      marker.setIcon(newIcon);
    });
  }, [map]);


useEffect(() => {
    if (map) {
      // Clear existing markers when ports change

        Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
        markersRef.current = {}; 
  
      
  
      // Fly to the selected port
      if (selectedPort && selectedPort.lat && selectedPort.long) {
        const marker = L.marker([selectedPort.lat, selectedPort.long], {
          icon: createPointIcon(),
        });
  
        const popupContent = `<div class="popup-container">
            <div class="popup-header">
              <h3 class="popup-title">${selectedPort.name || 'No name'}</h3>
            </div>
          </div>`;
  
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current['selectedPort'] = marker;
  
        // Fly to selected port
        map.flyTo([selectedPort.lat, selectedPort.long], 6, {
          animate: true,
          duration: 1.5, // Smooth transition
        });
      }
  
      map.on('zoomend', updateIconsForZoom);
      return () => {
        map.off('zoomend', updateIconsForZoom);
      };
    }
  }, [map, ports, selectedPort, updateIconsForZoom]);
  
  return null;
};


MapWithPorts.propTypes = {
//   vessels: PropTypes.arrayOf(
//     PropTypes.shape({
//       caseid: PropTypes.number,
//       lat: PropTypes.number.isRequired,
//       lng: PropTypes.number.isRequired,
//       name: PropTypes.string,
//       imo: PropTypes.number,
//       speed: PropTypes.number,
//       heading: PropTypes.number,
//       SpireTransportType: PropTypes.string,
//       eta: PropTypes.string,
//       destination: PropTypes.string,
//     }).isRequired
//   ).isRequired,
//   selectedVessel: PropTypes.shape({
//     SpireTransportType: PropTypes.string,
//     name: PropTypes.string.isRequired,
//     imo: PropTypes.number,
//     speed: PropTypes.number,
//     caseid: PropTypes.number,
//     lat: PropTypes.number.isRequired,
//     lng: PropTypes.number.isRequired,
//     heading: PropTypes.number,
//     speed: PropTypes.number,
//     eta: PropTypes.string,
//     destination: PropTypes.string,
//   }),
  ports: PropTypes.array.isRequired,
    selectedPort:  PropTypes.object.isRequired,
  
};

export default MapWithPorts;





