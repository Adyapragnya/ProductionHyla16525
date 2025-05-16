
  import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


// Import necessary Leaflet CSS
import 'leaflet/dist/leaflet.css';

const MyMapComponent = () => {
  const position = [51.50853, -0.12574 ]; // Example position for the map center

  return (
    <MapContainer center={position} zoom={1.5} style={{ height: '450px', width: '100%', borderRadius:'12px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MyMapComponent;



