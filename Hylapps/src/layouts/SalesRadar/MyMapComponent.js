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

import {   LayersControl } from 'react-leaflet';

const { BaseLayer } = LayersControl;

// import MapWithGeofencesTerrestrial from './MapWithGeofencesTerrestrial';
const MyMapComponent = ({ vessels, selectedVessel, ports, selectedPort }) => {


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
      <MapContainer center={[0, 0]} minZoom={2.3} zoom={1.5} maxZoom={18} 
                    maxBounds={[[180, -180], [-180, 180]]} // Strict world bounds to prevent panning
                    maxBoundsViscosity={8} // Makes the map rigid
                   style={{ height: '55vh', width: '100%', borderRadius: "10px"
                  //  , backgroundColor: 'rgba(170,211,223,255)'
                   }}>
      
      <LayersControl position="topright">

         {/* Satellite Layer (using Mapbox as an example) */}
         <BaseLayer  name="Mapbox Satellite">
      <TileLayer
        url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmlydTEyMjEiLCJhIjoiY2xpZnNnMW96MG5wdDNxcGRrZm16MHpmNyJ9.6s-u4RK92AQRxLZu2F4Rzw"
        noWrap={true}
      />
    </BaseLayer>
    {/* OpenStreetMap Layer */}
    <BaseLayer checked name="OpenStreetMap">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
    </BaseLayer>
  </LayersControl>
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
  vessels: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedVessel: PropTypes.object,
  ports: PropTypes.array.isRequired,
  selectedPort:  PropTypes.object.isRequired,
  // setVesselEntries: PropTypes.func.isRequired,
};

export default MyMapComponent;


