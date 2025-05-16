import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../AuthContext";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MapWithDraw from "./MapWithDraw";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import EditGeofences from './EditGeofences';
import MapWithFullscreen from './MapWithFullscreen';
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Button, Box,ListItemText } from "@mui/material";
import MeasureControl from './MeasureControl';
import FlyToPort from "./FlyToPort";
import MapWithMarkers from './MapWithMarkers';
import GeofenceMessage from './GeofenceMessage';
import GeofenceHistories from "./GeofenceHistories";
import MapWithCircleGeofences from "./MapWithCircleGeofences";
import GeofenceDetails from "./GeofenceDetails.js";

import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon, lineString } from '@turf/turf';
import 'leaflet.markercluster';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import './MyMapComponent.css'; 
import {   LayersControl } from 'react-leaflet';

const { BaseLayer } = LayersControl;

import SearchControl from './SearchControl';

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "white",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)", // Keeps label centered by default
          transition: "all 0.2s ease-in-out",
          padding: "4px", 
          display: "flex",
          alignItems: "center",
    
          "&.MuiInputLabel-shrink": {
            top: "-16px",  // Moves label above the border
            transform: "translateY(0)",
            background: "#0F67B1",
            padding: "2px 2px", // Adds small padding so it doesn't touch the border
            margin: "4px 8px",
          },
    
          "&.Mui-focused": {
            color: "white",
          },
    
          [theme.breakpoints.down("sm")]: {
            fontSize: "10px", // Adjust for small screens
          },
          
          [theme.breakpoints.down("md")]: {
            fontSize: "12px", // Adjust for small screens
          },
        }),
      },
    },
    
    
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          color: "white",
          display: "flex",
          alignItems: "center",
          height: "44px", // Adjust height
    
          [theme.breakpoints.down("md")]: {
            height: "36px",
          },
          [theme.breakpoints.down("sm")]: {
            height: "32px",
          },
        }),
        input: {
          padding: "10px 16px", // Keeps text centered
        },
      },
    },
    
    
    MuiAutocomplete: {
      styleOverrides: {
        root: ({ theme }) => ({
    
          minHeight: "40px",
          [theme.breakpoints.down("md")]: {
            minHeight: "36px",
          },
          [theme.breakpoints.down("sm")]: {
            minHeight: "32px",
          },
        }),
        inputRoot: {
          color: "white",
        },
        option: {
          padding: "2px 4px", // Default padding
          fontSize: "14px",
    
          "@media (max-width:600px)": {
            margin:"0px" ,
            padding: "2px 4px !important" , // Reduce padding for small screens
            fontSize: "10px",
          },
        },
      },
    },
  },
});

<ThemeProvider theme={theme}>
  <Autocomplete
    sx={{
      "& .MuiOutlinedInput-root": {
        display: "flex",
        alignItems: "center", // Ensures text stays centered
      },
    }}
    // {...otherProps}
/>
</ThemeProvider>;



// Custom icon for port markers
const portIcon = new L.Icon({
  iconUrl: "/anchor-icon.png ", // Example ship icon
  //  https://cdn-icons-png.flaticon.com/512/684/684908.png
  iconSize: [15, 15],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});



const ModifyGeofence = () => {
  const mapRef = useRef(null);
  const [geofences, setGeofences] = useState([]);
  const [filteredGeofences, setFilteredGeofences] = useState([]);
    const [polygonGeofences, setPolygonGeofences] = useState([]);
    const [polylineGeofences, setPolylineGeofences] = useState([]);
    const [circleGeofences, setCircleGeofences] = useState([]);
    const [terrestrialGeofences, setTerrestrialGeofences] = useState([]);
    const [breakwatersLineGeofences, setBreakwatersLineGeofences] = useState([]);

  const [vesselBufferGeofences, setVesselBufferGeofences] = useState([]);

  const [vesselHistory, setVesselHistory] = useState([]);


  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [editingMode, setEditingMode] = useState(false); // Manage editing mode
  const [geofenceNames, setGeofenceNames] = useState([]);
  const [ports, setPorts] = useState([]); // Store ports data
  const [portnames, setPortnames] = useState([]); // Store ports data

  const [selectedPort, setSelectedPort] = useState(null);
  const [geofenceTypes, setGeofenceTypes] = useState([]);
  const [selectedGeofenceType, setSelectedGeofenceType] = useState("");



    const [vessels, setVessels] = useState([]);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [vesselEntries, setVesselEntries] = useState({});
    const [notifications, setNotifications] = useState([]);
    const { role, id } = useContext(AuthContext);
    const [loading, setLoading]=useState(false);
    const [error, setError ]=useState("");
    const [vesselTableData, setVesselTableData] = useState([]);
  
    const [geofenceUpdateTrigger, setGeofenceUpdateTrigger] = useState(0);

const handleGeofenceChange = () => {
  setGeofenceUpdateTrigger(prev => prev + 1); // Increment to trigger useEffect
};


  const fetchGeofences = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      const responses = await Promise.allSettled([
        axios.get(`${baseURL}/api/polygonTerrestrialGeofences-2`),
        axios.get(`${baseURL}/api/polygongeofences`),
        axios.get(`${baseURL}/api/polylinegeofences`),
        axios.get(`${baseURL}/api/circlegeofences`),
        axios.get(`${baseURL}/api/get-vessel-buffer-geofences`)
       
      ]);
  
      const [terrestrialGeofenceResponse ,polygonResponse, polylineResponse, circleResponse, vesselBufferResponse  ] = responses.map(res =>
        res.status === "fulfilled" ? res.value.data : []
      );
  
      const allGeofences = [...terrestrialGeofenceResponse, ...polygonResponse, ...polylineResponse, ...circleResponse, ...vesselBufferResponse ];
  
      setGeofences(allGeofences);
      setFilteredGeofences(allGeofences);



    setPolygonGeofences(polygonResponse);
    setPolylineGeofences(polylineResponse);
    setCircleGeofences(circleResponse);
    setTerrestrialGeofences(terrestrialGeofenceResponse);
    setVesselBufferGeofences(vesselBufferResponse);
    
    
    const filteredBreakWatersLineGfs = polylineResponse.filter(item => item.geofenceType === "breakwaters");
    //  console.log(filteredTerrestrialData);
    setBreakwatersLineGeofences(filteredBreakWatersLineGfs);
   

  
      // Extract unique geofence types
      const uniqueTypes = [...new Set(allGeofences.map(g => g.type))];
      setGeofenceTypes(uniqueTypes);


  
      // // Set map center to first valid geofence
      // const firstValidGeofence = allGeofences.find(
      //   (geofence) =>
      //     geofence.coordinates &&
      //     geofence.coordinates[0] &&
      //     !isNaN(geofence.coordinates[0].lat) &&
      //     !isNaN(geofence.coordinates[0].lng)
      // );
  
      // if (firstValidGeofence) {
      //   setMapCenter([firstValidGeofence.coordinates[0].lng, firstValidGeofence.coordinates[0].lat]);
      // }
    } catch (error) {
      console.error("Error fetching geofences:", error);
    }
  };

  const fetchPorts = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-ports`);
      
      if (Array.isArray(response.data)) {
        setPorts(response.data);
        const uniquePortnames = [...new Set(response.data.map(port => port.name))];
        setPortnames(uniquePortnames);
      } else {
        console.error("Invalid ports data received:", response.data);
        setPorts([]); // Ensure we don't pass undefined
      }
    } catch (error) {
      console.error("Error fetching ports:", error);
      setPorts([]); // Handle error by setting an empty array
    }
  };
  

  

  useEffect(() => {
    fetchGeofences();
    // fetchVesselBufferGeofences();
    fetchPorts();
  

  }, [geofenceUpdateTrigger]);

  
   // Handle Geofence Type Selection
   const handleGeofenceTypeSelect = (event, value) => {
    setSelectedGeofenceType(value);
  
    if (!value) {
      // If no geofence type is selected but a port is selected, filter by port only
      setFilteredGeofences(
        selectedPort ? geofences.filter((geofence) => geofence.seaport === selectedPort.name) : geofences
      );
    } else if (value === "VesselBuffer") {
      setSelectedPort(null); // Reset port selection
      setFilteredGeofences(
        geofences.filter((geofence) =>
          geofence.type === value
        )
      );

    } else {
      // Apply both geofence type and port filters
      setFilteredGeofences(
        geofences.filter((geofence) =>
          (!selectedPort || geofence.seaport === selectedPort.name) &&
          geofence.type === value
        )
      );

    }
  
    setSelectedGeofence(null); // Reset selected geofence
  };
  

  // Handle Geofence Selection
  // const handleGeofenceSelect = (event, value) => {
  //   setSelectedGeofence(value);
  // };

  const handleGeofenceSelect   = (event, value) => {

    if (!value) {
      setSelectedGeofence(null); // If nothing is selected, reset selectedGeofence
      return;
    }

    setSelectedGeofence(value || null);
  
  };

  const handlePortSelect = (event, value) => {

    if (!value) {
      setSelectedPort(null);
  
      // If a geofence type is selected, filter by type only
      setFilteredGeofences(
        selectedGeofenceType
          ? geofences.filter((geofence) => geofence.type === selectedGeofenceType)
          : geofences
      );
      return;
    }

    // Find the selected geofence from geofences
    // const geofenceData = geofences.find((geofence) => geofence.geofenceName === value.geofenceName);
    setSelectedPort(value || null);
    // setFilteredGeofences(geofences.filter((geofence) => geofence.type === value));

    setFilteredGeofences(
      geofences.filter((geofence) =>
        (!selectedGeofenceType || geofence.type === selectedGeofenceType) &&
        geofence.seaport === value.name
      )
    );
    
  };



  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    axios.get(`${baseURL}/api/get-vessel-histories`)
      .then((response) => {
        
        const responseData = response.data;
        // console.log(responseData);
        setVesselHistory(responseData);

      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
        setLoading(false);
      });
  }, []);

  const ensureClosedPolygon = (coordinates) => {
    if (coordinates.length > 0) {
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coordinates.push([firstPoint[0], firstPoint[1]]);
      }
    }
    return coordinates;
  };

  useEffect(() => {
    const checkVesselsInGeofences = () => {
      const updatedVesselEntries = {};
      vessels.forEach((vessel) => {
        const vesselPoint = point([vessel.lng, vessel.lat]);
        // console.log(vesselPoint);

        if (!vesselPoint.geometry.coordinates || vesselPoint.geometry.coordinates.length !== 2) {
          console.error("Invalid vessel coordinates:", vessel.lng, vessel.lat);
          return;
        }


        const overlappingGeofences = []; // To track overlapping geofences with type
        const overlappingStatus = []; 
        let isInsideAnyGeofence = false;
        // let isInsideWaterBound = false; // To specifically track Water Bound geofence
  
        const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
        // Polygon geofences
        polygonGeofences.forEach((geofence) => {
          const geofenceCoordinates = ensureClosedPolygon(
            geofence.coordinates.map((coord) => [coord.lat, coord.lng])
          );
          const geofencePolygon = polygon([geofenceCoordinates]);
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
          if (isInside) {
            overlappingGeofences.push(`Inside ${geofence.geofenceName} || ${geofence.geofenceType ||  '-'} || ${geofence.seaport}`);
            isInsideAnyGeofence = true;
          }
        });
  
        // Circle geofences
        circleGeofences.forEach((geofence) => {
          const { lat, lng, radius } = geofence.coordinates[0];
          const distance = turf.distance(vesselPoint, point([lng, lat]), { units: 'meters' });
          const isInsideCircle = distance <= radius;
  
          if (isInsideCircle) {
            overlappingGeofences.push(`Inside ${geofence.geofenceName} || ${geofence.geofenceType || '-'} || ${geofence.seaport} `);
            isInsideAnyGeofence = true;
          }
        });
  
        polylineGeofences.forEach((geofence) => {
          const geofenceLine = lineString(geofence.coordinates.map((coord) => [coord.lat, coord.lng]));
          const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });

          const isNearPolyline = distanceToPolyline <= 3000;
        
          // if (isNearPolyline) {
          //   overlappingGeofences.push(`
          //     ${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
          //   `);
          //   isInsideAnyGeofence = true;
          // }
        
   
         
          
 // Check for crossing
 const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
 if (historydata.length === 0) {
   console.error("No history data found for IMO:", vessel.imo);
   return;
 }

 const history = historydata[0]?.history;
 if (!history || history.length === 0) {
   console.error("History is undefined or empty for IMO:", vessel.imo);
   return;
 }

 let lastPosition;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }
 

 let previousVesselPoint;
 
 if (lastPosition && lastPosition.LONGITUDE !== undefined && lastPosition.LATITUDE !== undefined) {
  previousVesselPoint = [lastPosition.LATITUDE, lastPosition.LONGITUDE];
 } else {
  // console.error("Previous position data is invalid.");
  
}


//  console.log(previousVesselPoint);
 

// Check if previousVesselPoint is valid before proceeding
if (!previousVesselPoint || previousVesselPoint[0] === undefined || previousVesselPoint[1] === undefined) {
  // console.error("Previous vessel point data is missing");
  return; // Don't proceed further if data is missing
}


//  console.log(vessel.lng, vessel.lat);

 const currentLocationPoint = [vessel.lat, vessel.lng];
//  console.log(currentLocationPoint);

 const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
//  console.log(vesselPath);
//  console.log(geofenceLine);

 let intersection;

 if( vesselPath && geofenceLine ){

   intersection = turf.lineIntersect(vesselPath, geofenceLine);

 }


       if (intersection.features.length > 0) {
        //  console.log(intersection,vessel);
           //   overlappingGeofences.push(`
          //     ${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
          //   `);
          //   isInsideAnyGeofence = true;
    if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
     updatedVesselEntries[vessel.name] = {
       entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
       geofence: `Crossed ${geofence.geofenceName} || ${geofence.geofenceType} `,
       status: `Crossed `,
       exitTime: null
     };
     isInsideAnyGeofence = true;
           

     updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
   }
 }





        });
        
       


        // Water Bound geofences
        // WaterBoundGeofence.forEach((geofence) => {
        //   const geofenceCoordinates = ensureClosedPolygon(
        //     geofence.coordinates.map((coord) => [coord.lat, coord.lng])
        //   );
        //   const geofencePolygon = polygon([geofenceCoordinates]);
        //   const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
        //   if (isInside) {
        //     overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType || 'Water Bound'}`);
        //     isInsideWaterBound = true;
        //   }
        // });
  

        

          


        // Update geofence status based on overlaps
        if (overlappingGeofences.length > 0) {
          const geofenceInsideTime = getCurrentDate();
          updatedVesselEntries[vessel.name] = {
            entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
            geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
            status:  'Inside',
            exitTime: null,
          };
  
          overlappingGeofences.forEach((geofenceDetail) => {
            const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
            updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'Inside');
          });
        } else if (
          !isInsideAnyGeofence &&
          (vesselTableData[vessel.name]?.status === 'Inside' || vesselTableData[vessel.name]?.status.includes('Near'))
        ) {
          // Handle exit scenario
          updatedVesselEntries[vessel.name] = {
            status:'Outside',
            exitTime: getCurrentDate(),
          };
          updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), null, 'Outside');
        }


         // terrestrial inport type geofences
         terrestrialGeofences
         .filter((geofence) => geofence.geofenceType === "inport")
         .forEach((geofence) => {

// console.log(geofence);
           
          const geofenceCoordinates = ensureClosedPolygon(
            geofence.coordinates.map((coord) => [coord.lat, coord.lng])
          );
          const geofencePolygon = polygon([geofenceCoordinates]);
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  // .....
//    // checking INBOUND

//    console.log(isInside);

          if (isInside) {
            // ..
            breakwatersLineGeofences.forEach((linegeofence) => {
              const geofenceLine = lineString(linegeofence.coordinates.map((coord) => [coord.lng, coord.lat]));
              const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
              const isNearPolyline = distanceToPolyline <= 3000;
            
              // if (isNearPolyline) {
              //   overlappingGeofences.push(`
              //     ${linegeofence.geofenceName} (${linegeofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
              //   `);
              //   isInsideAnyGeofence = true;
              // }
            
       
             
              
     // Check for crossing
     const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
     if (historydata.length === 0) {
       console.error("No history data found for IMO:", vessel.imo);
       return;
     }
    
     const history = historydata[0]?.history;
     if (!history || history.length === 0) {
       console.error("History is undefined or empty for IMO:", vessel.imo);
       return;
     }
    
     let lastPosition;
     let previousVesselPoint;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
   previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
 
 }


 

    //  console.log(previousVesselPoint);
     if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
       console.error("Previous vessel point data is missing");
       return;
     }

    //  console.log(vessel.lng, vessel.lat);
     
     let currentLocationPoint = [vessel.lng, vessel.lat];
     let vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
    //  console.log(vesselPath);
     let intersection = turf.lineIntersect(vesselPath, geofenceLine);
    //  console.log(intersection);

     if (intersection.features.length === 0) {
      // No intersection found, fall back to the previous history position if possible
      if (history.length >= 3) {
        lastPosition = history[history.length - 3];  // Check the previous-to-last position
        previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
        vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
        // console.log(vesselPath);
        intersection = turf.lineIntersect(vesselPath, geofenceLine);
        // console.log(intersection);
    
    
      }
     
      else {
        console.error('No fallback position found');
      }
  
      
    }

    // when intersects ,it means its crossed the 
           if (intersection.features.length > 0) {
            console.log('inbounnnnnnnnnd',vessel);
            overlappingGeofences.push(` Crossed ${linegeofence.geofenceName} || ${linegeofence.geofenceType || '-'} `);
            isInsideAnyGeofence = true;
            // console.log(overlappingGeofences);
            if (overlappingGeofences.length > 0) {
              const geofenceInsideTime = getCurrentDate();
              updatedVesselEntries[vessel.name] = {
                entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
                geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
                status:  `INBOUND - ${geofence.geofenceName}`,
                exitTime: null,
              };
      
              overlappingGeofences.forEach((geofenceDetail) => {

                // console.log('inbounnnnnnnnnd');
                const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
                updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'INBOUND');
              });
            }

      //   if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
      //    updatedVesselEntries[vessel.name] = {
      //      entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
      //      geofence: geofence.geofenceName,
      //       status: `${geofence.geofenceName} has been crossed `,
      //      exitTime: null
      //    };
      //    isInsideAnyGeofence = true;
               
    
      //    updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
      //  }
     }
    
    
    
    
    
            });
            // .. 
          
          } 

          // checking OUTBOUND
          if(!isInside){

                 const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
                if (historydata.length === 0) {
                  console.error("No history data found for IMO - outbound check:", vessel.imo);
                  return;
                }
        
                const history = historydata[0]?.history;
                if (!history || history.length === 0) {
                  console.error("History is undefined or empty for IMO - outbound check:", vessel.imo);
                  return;
                }
        
                let lastPosition;

 if (history.length >= 3) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }
 let previousVesselPoint;
 if (lastPosition && lastPosition.LONGITUDE !== undefined && lastPosition.LATITUDE !== undefined) {
                 previousVesselPoint = point([lastPosition.LONGITUDE, lastPosition.LATITUDE]);
 } else {
  console.error("Invalid / unavailable lastPosition data:", lastPosition);
  return;
}
              
                  // if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
                  //   console.error("Previous vessel point data is missing");
                  //   return;
                  // }

                  
                  if (!previousVesselPoint || !previousVesselPoint.geometry || previousVesselPoint.geometry.coordinates.length !== 2) {
                    console.error("Previous vessel point data is invalid:", previousVesselPoint);
                    return;
                  }
                  
                // console.log(previousVesselPoint);
                // console.log(geofencePolygon);
    
              
                const isPreviousPointInside = booleanPointInPolygon(previousVesselPoint, geofencePolygon);
                // console.log(isPreviousPointInside);

                if (isPreviousPointInside) {

                  breakwatersLineGeofences.forEach((linegeofence) => {
                    const geofenceLine = lineString(linegeofence.coordinates.map((coord) => [coord.lng, coord.lat]));
                    const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
                    const isNearPolyline = distanceToPolyline <= 3000;
                  
                    // if (isNearPolyline) {
                    //   overlappingGeofences.push(`
                    //     ${linegeofence.geofenceName} (${linegeofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
                    //   `);
                    //   isInsideAnyGeofence = true;
                    // }
                  
             
                   
                    
           // Check for crossing
           const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
           if (historydata.length === 0) {
             console.error("No history data found for IMO:", vessel.imo);
             return;
           }
          
           const history = historydata[0]?.history;
           if (!history || history.length === 0) {
             console.error("History is undefined or empty for IMO:", vessel.imo);
             return;
           }
          
           let lastPosition;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }

 let previousVesselPoint;
 if (lastPosition && lastPosition.LONGITUDE !== undefined) {
            previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
 }
 
          //  console.log(previousVesselPoint);
           if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
             console.error("Previous vessel point data is missing");
             return;
           }
          //  console.log(vessel.lng, vessel.lat);
          
           const currentLocationPoint = [vessel.lng, vessel.lat];
           const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
          //  console.log(vesselPath);
           const intersection = turf.lineIntersect(vesselPath, geofenceLine);
          //  console.log(intersection);
          // when intersects ,it means its crossed the 
                 if (intersection.features.length > 0) {
                  // console.log('outbounddd');
                  overlappingGeofences.push(`Crossed ${linegeofence.geofenceName} || ${linegeofence.geofenceType || '-'}`);
                  isInsideAnyGeofence = true;
                  // console.log(overlappingGeofences);
                  if (overlappingGeofences.length > 0) {
                    const geofenceInsideTime = getCurrentDate();
                    updatedVesselEntries[vessel.name] = {
                      entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
                      geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
                      status:  `OUTBOUND - ${geofence.geofenceName}`,
                      exitTime: null,
                    };
            
                    overlappingGeofences.forEach((geofenceDetail) => {
      
                      console.log('outbounnnnnnnnnd');
                      const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
                      updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'OUTBOUND');
                    });
                  }
      
          
           }
          
          
          
          
          
                  });
                } 

          }



     



 // .....
        });

      });
  
      setVesselEntries((prevEntries) => ({
        ...prevEntries,
        ...updatedVesselEntries,
      }));
    };
  
    if (
      vessels.length &&
      (polygonGeofences.length || circleGeofences.length || polylineGeofences.length )
    ) {
      checkVesselsInGeofences();
    }
  }, [vessels, polygonGeofences, circleGeofences, polylineGeofences, setVesselEntries]);

  
  
  
  
  
  const updateGeofenceInDB = async (vesselName, LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // await axios.post(`${baseURL}/api/vesselHistory/${vesselName}`, {
      //   LATITUDE,
      //   LONGITUDE,
      //   TIMESTAMP,
      //   geofenceName,  
      //   geofenceFlag   
      // });
     
    } catch (error) {
      console.error('Error updating geofence status in DB:', error);
    }
  };
  
  




  // from original geofence start

  
  const handleRowClick = (vessel) => {
    // console.log('Row click event received with vessel:', vessel); // Log received vessel
    const selected = vessels.find(v => v.name === vessel.name);
    if (selected) {
      setSelectedVessel(selected);
      // console.log("Selected vessel:", selected);
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel ? [selectedVessel.lat, selectedVessel.lng] : calculateMapCenter();
  const zoom = selectedVessel ? 10 : 6;

 
  


  // Helper function to extract organization part
  const extractOrgPart = (value) => {

    let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
    
    return orgId;
  };
  
  
  
    
   // Helper function to fetch tracked vessels by user
  const fetchTrackedVesselsByUser = async (userId) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
      // console.log(response);
      return response.data.filter(vessel => vessel.loginUserId === userId);
     
      
    } catch (error) {
      console.error("Error fetching tracked vessels by user:", error);
      return [];
    }
  };
  
    

  
   // Helper function to fetch tracked vessels by user
   const fetchTrackedVesselsByOrg = async (orgId) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
      // console.log(response);
      return response.data.filter(vessel => vessel.OrgId === orgId);
     
      
    } catch (error) {
      console.error("Error fetching tracked vessels by user:", error);
      return [];
    }
  };
  
  
  
  // new start
  
  const fetchVesselIMOValues = async (userId) => {
    try {
      // Extract orgId from userId
      let OrgId = userId.includes('_') ? userId.split('_')[1] : userId.split('_')[0];
      
      // Define the base URL for the API
      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      // Fetch only the relevant vessels from the server based on orgId
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-OrgId`, {
        params: {
          OrgId: OrgId
        }
      });
  
     
  
    
      const vesselsFiltered = response.data;
  
   
      
      return vesselsFiltered;
    } catch (error) {
      console.error("Error fetching IMO values:", error);
      return [];
    }
  };
  
  
  
  // new end
  
  const fetchVesselById = async (userId) => {
    try {
    
      
      // Define the base URL for the API
      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      // Fetch only the relevant vessels from the server based on orgId
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-loginUserId`, {
        params: {
          loginUserId : userId
        }
      });
  
     
  
      // Extract IMO values from the response
      const vesselsFiltered = response.data;
  
   
      
      return vesselsFiltered;
    } catch (error) {
      console.error("Error fetching vessels values:", error);
      return [];
    }
  };
  
  
  
  
  const fetchVessels = async (role, userId) => {
    try {
      // Fetch the tracked vessels for the user first
      const trackedByUser = await fetchTrackedVesselsByUser(userId);
      // console.log(trackedByUser);
  
      // Ensure tracked vessels have a valid IMO and extract them
      const trackedIMO = trackedByUser.filter(vessel => vessel.IMO).map(vessel => vessel.IMO);
  
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // Now fetch all vessels
     
      const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
      
      const allVessels = response.data;
      
     // Initialize an empty array to store the filtered vessels
      const filteredVessels = [];
  
  
        if (role === 'hyla admin') {
          // For 'hyla admin', return all vessels whose IMO is in the tracked IMO list
          filteredVessels.push(...allVessels); // Spread allVessels into filteredVessels to avoid nested array
        } else if (role === 'organization admin' || role === 'organizational user') {
        
  
          // Now, you need to fetch the IMO values for the user
          const vesselsFiltered = await fetchVesselIMOValues(userId); // Await this async function
  
          // Check if the vessel IMO is in the fetched IMO values
          filteredVessels.push(...vesselsFiltered); // to avoid array inside array nested
         
          
        } else if (role === 'guest') {
          // For 'guest', filter vessels based on loginUserId
       
  
              // Now, you need to fetch the IMO values for the user
              const vesselsFiltered = await fetchVesselById(userId); // Await this async function
              filteredVessels.push(...vesselsFiltered); // to avoid array inside array nested
        }else{
          console.log('not found')
        }
      
      
  
    
  
      // console.log('Filtered Vessels:', finalVessels);
      return filteredVessels;
  
    } catch (error) {
      console.error("Error fetching vessels:", error);
      return [];
    }
  };
  
  
  
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    
  
    fetchVessels(role, id)
      .then(filteredVessels => {
        // Process filtered data
  // console.log(filteredVessels);
        const transformedData = filteredVessels.map((vessel) => ({
          SpireTransportType: vessel.SpireTransportType|| '',
          name: vessel.AIS?.NAME || "-",
          timestamp: vessel.AIS?.TIMESTAMP || "-",
          imo: vessel.AIS?.IMO || 0,
          speed: vessel.AIS?.SPEED || 0,
          lat: vessel.AIS?.LATITUDE || 0,
          lng: vessel.AIS?.LONGITUDE || 0,
          heading: vessel.AIS?.HEADING || 0,
          status: vessel.AIS?.NAVSTAT || 0,
          eta: vessel.AIS?.ETA || 0,
          destination: vessel.AIS?.DESTINATION || '',
          zone: vessel.AIS?.ZONE || '',
        }));
        // console.log(transformedData);
  
  
        setVessels(transformedData);
     

      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
        // setError(err.message);
      })
      
  }, [role,id]);
  
  

  
  

  // Modify handleNewGeofenceEntry to include the vessel's name and geofence details
  const handleNewGeofenceEntry = (message, vessel) => {
    setNotifications((prev) => [
      ...prev,
      {
        title: `${vessel.name} has entered ${message.title}`,
        date: new Date().toLocaleTimeString(),
        image: <img src={team2} alt="vessel" />,
      }
    ]);
  };

  // Disable keyboard shortcuts and mouse zoom
  useEffect(() => {
    // const handleKeyDown = (event) => {
     
    //   if (event.key.startsWith('F') || (event.ctrlKey && (event.key === '+' || event.key === '-'))) {
    //     event.preventDefault();
    //     toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
    //   }
    // };

    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
      }
    };

    // Add event listeners
    // window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup event listeners on component unmount
    return () => {
      // window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  

  return (
     <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />
      <ArgonBox py={3}>

      {/* <Card sx={{}} py={0}>
  <CardContent  py={0}> */}
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {/* First Autocomplete */}

      <ThemeProvider theme={theme}>

      {selectedGeofenceType !== "VesselBuffer" && (
              <Autocomplete
            PaperProps={{
              sx: {
                borderRadius: "10px", // Rounds the dropdown menu
                overflow: "hidden", // Ensures no clipping
              },
            }}
          options={ports || []}
          getOptionLabel={(option) => {
            console.log("Option in getOptionLabel:", option);
            return typeof option === "object" && option?.name ? option.name : "";
          }}
          onChange={handlePortSelect}
          renderInput={(params) => (
            <TextField {...params} label="Select Port" variant="outlined" />
          )}
          sx={{ flex: 1, minWidth: 250,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", // Ensures input box is rounded
            },
          }}
        />
      )}

          <Autocomplete
            PaperProps={{
              sx: {
                borderRadius: "10px", // Rounds the dropdown menu
                overflow: "hidden", // Ensures no clipping
              },
            }}
          options={geofenceTypes}
          getOptionLabel={(option) => option || ""}
          value={selectedGeofenceType}
          onChange={handleGeofenceTypeSelect}
          renderInput={(params) => (
          <TextField {...params} label="Select Geofence Type" variant="outlined" />
          )}
          sx={{ flex: 1, minWidth: 250 , 
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", // Ensures input box is rounded
            },
            }} 
          />
  
        <Autocomplete
             PaperProps={{
              sx: {
                borderRadius: "10px", // Rounds the dropdown menu
                overflow: "hidden", // Ensures no clipping
              },
            }}
                  options={filteredGeofences} // Already filtered by selected type
                  getOptionLabel={(option) => option?.geofenceName || option?.NAME || ""} 
                  renderOption={(props, item) => (
                    <li {...props} key={item._id}>
                         <span style={{ fontWeight: 'normal' }}> {item.geofenceName || item.NAME}</span> ({item.type || "N/A"} )
                    </li>
                  )}
                  value={selectedGeofence}
                  onChange={handleGeofenceSelect}
                  clearOnEscape
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) =>
                      option?.geofenceName?.toLowerCase().includes(inputValue.toLowerCase()) 
                  ||   option?.NAME?.toLowerCase().includes(inputValue.toLowerCase()) 
                    )
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Geofence to edit/delete" variant="outlined" />
                  )}
                  sx={{ flex: 1, minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", // Ensures input box is rounded
                    },
                   }} 
                />


</ThemeProvider>

         </Box>
  {/* </CardContent>
</Card> */}

             
          
          
<Grid container py={2} mt={1}>
    <Grid item xs={12} style={{borderRadius: "10px"}}>
      <Card
      sx={{
        backgroundColor: "white",
        borderRadius: "15px",
        boxShadow: 1,
        padding: "10px", // Ensure no padding
        margin: "0px", // Ensure no margin
        display: "flex", // Helps remove unwanted gaps
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          backgroundColor: "white",
          padding: "0px !important", // Force override default padding
          margin: "0px",
          "&:last-child": { padding: "0px" }, // Ensures last-child padding is removed
        }}
      >

                {/* <MapContainer center={[0, 0]}  zoom={2} 
                style={{ height: '760px' , borderRadius: "15px" ,  boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                   > */}
              <div style={{ position: "relative", width: "100%", height: "81%", }}>
                    {/* ✅ Vessel + Address Search Bar */}
                
                  <MapContainer id="map"  center={[0, 0]} minZoom={2.8} zoom={2.8} maxZoom={18}  whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      
                                maxBounds={[[95, -180], [-95, 180]]}
                                maxBoundsViscosity={1.0}
                                worldCopyJump={true} // ⬅️ Fixes blank area when zooming out
                                style={{
                                  height: "75vh",
                                  width: "100%",
                                  marginTop: "7px",
                                  borderRadius: "17px",
                                  backgroundSize: "contain", // ✅ Placed correctly
                                  backgroundRepeat: "no-repeat", // ✅ Placed correctly
                                }}
                                >
                  {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
                   <LayersControl position="topright">
                  
                         {/* Satellite Layer (using Mapbox as an example) */}
                         <LayersControl.BaseLayer name="Mapbox Satellite">
                      <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmlydTEyMjEiLCJhIjoiY2xpZnNnMW96MG5wdDNxcGRrZm16MHpmNyJ9.6s-u4RK92AQRxLZu2F4Rzw"
                        noWrap={true}
                      />
                      </LayersControl.BaseLayer>
                
                    
                
                    {/* OpenStreetMap Layer */}
                  
                       <LayersControl.BaseLayer checked name="OpenStreetMap">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        noWrap={true}
                      />
                          </LayersControl.BaseLayer>
                
                   
                
                  </LayersControl>
                  <SearchControl vessels={vessels} />
                

                  <MapWithFullscreen />
                  {/* <MapWithCircleGeofences geofences={vesselBufferGeofences} /> */}
                  <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />

                  <EditGeofences
                    geofences={filteredGeofences}
                    selectedGeofence={selectedGeofence}
                    setSelectedGeofence={setSelectedGeofence}
                    setGeofences={setGeofences}
                    setFilteredGeofences={setFilteredGeofences}
                    handleGeofenceChange={handleGeofenceChange} 

                  />
                  <MeasureControl />
                  <MapWithDraw 
                    vessels={vessels}
                    portnames={portnames} 
                    setGeofences={setGeofences} 
                    setFilteredGeofences={setFilteredGeofences}
                    handleGeofenceChange={handleGeofenceChange} 
                    map={mapRef.current}  
                  />

 {/* Correct way to use FlyToPort */}
                {selectedPort && <FlyToPort selectedPort={selectedPort} />} 

             
             
{/* Only render the selected port marker */}
{selectedPort && (
  <Marker position={[selectedPort.lat, selectedPort.long]} icon={portIcon}>
    <Popup>
      <b>{selectedPort.name}</b> <br />
      UNLOCODE: {selectedPort.UNLOCODE} <br />
    </Popup>
  </Marker>
)}

                </MapContainer>
                </div>
               
                </CardContent>
      </Card>
    </Grid>
</Grid>

          <Grid container spacing={3} mt={0}>
                  {/* <Grid item xs={12} md={12}>
                    <Card sx={{ height: "auto" }}>
                      <CardContent>
                      <GeofenceMessage
                          vesselEntries={vesselEntries}
                          vessels={vessels}
                          onRowClick={handleRowClick}
                        />
                      </CardContent>
                    </Card>
                  </Grid> */}
                  <Grid item xs={12} md={12}>
                    <Card sx={{ height: "auto" }}>
                      {/* <CardContent> */}
                      <GeofenceDetails 
                        vesselEntries={vesselEntries}
                        vessels={vessels}
                        onRowClick={handleRowClick}
                      />

                      {/* <GeofenceHistories
                          vesselEntries={vesselEntries}
                          vessels={vessels}
                          onRowClick={handleRowClick}
                        /> */}
                      {/* </CardContent> */}
                    </Card>
                  </Grid>
          </Grid>
       
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
};

export default ModifyGeofence;
