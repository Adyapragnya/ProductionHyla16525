import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import MapWithGeofences from './MapWithGeofences';
import MapWithMarkers from './MapWithMarkers';
import MapWithFullscreen from './MapWithFullscreen';
import MapWithDraw from './MapWithDraw';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon, lineString } from '@turf/turf';
import 'leaflet.markercluster';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MapWithPolylineGeofences from './MapWithPolylineGeofences';
import MapWithCircleGeofences from './MapWithCircleGeofences';
import './MyMapComponent.css'; // Import CSS file for styling
import MeasureControl from './MeasureControl';
import MapWithPorts from './MapWithPorts';

// import MapWithGeofencesTerrestrial from './MapWithGeofencesTerrestrial';
const MyMapComponent = ({ports, selectedPort, vessels, selectedVessel, setVesselEntries }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [polylineGeofences, setPolylineGeofences] = useState([]);
  const [circleGeofences, setCircleGeofences] = useState([]);
  const [terrestrialGeofences, setTerrestrialGeofences] = useState([]);
  const [buttonControl, setButtonControl] = useState(false);
  const [vesselTableData, setVesselTableData] = useState([]);

  const handleButtonControl = () => {
    setButtonControl(prev => !prev);
  };





  return (
    <div style={{backgroundColor: "white", padding: "5px"}}>
      {/* <div className="checkbox-container">
        <label className="checkbox-label">
          <input type="checkbox" checked={buttonControl} onChange={handleButtonControl} />
          Draw Mode
        </label>
      </div> */}
      {/* <br></br> */}

      <MapContainer center={[0, 0]} minZoom={1.5} zoom={1.5} maxZoom={18} 
                    maxBounds={[[85, -180], [-85, 180]]} // Strict world bounds to prevent panning
                    maxBoundsViscosity={8} // Makes the map rigid
                   style={{ height: '55vh', width: '100%', backgroundColor: 'rgba(170,211,223,255)', borderRadius: "10px"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true} />
        <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel}   />
          <MapWithPorts ports={ports} selectedPort={selectedPort} />
        <MapWithFullscreen />
        {buttonControl && <MapWithDraw />}
        {/* <MapWithGeofences geofences={polygonGeofences} /> */}
        {/* <MapWithPolylineGeofences geofences={polylineGeofences} /> */}
        {/* <MapWithCircleGeofences geofences={circleGeofences} /> */}
        {/* <MapWithGeofencesTerrestrial geofences={terrestrialGeofences} /> */}
        {/* <MeasureControl/> */}
      </MapContainer>
    </div>
  );
};

MyMapComponent.propTypes = {
   ports: PropTypes.array.isRequired,
  selectedPort:  PropTypes.object.isRequired,
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
  }),
  setVesselEntries: PropTypes.func.isRequired,
};

export default MyMapComponent;


