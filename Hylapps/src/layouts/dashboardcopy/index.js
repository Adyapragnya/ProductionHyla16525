import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {Box,Button,Tooltip} from "@mui/material"
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import MyMapComponent from "./MyMapComponent";
import VesselDetailsTable from "./VesselDetailsTable";
import DashCard from "./DashCard";
import PieChartComponent from "./PieChartComponent"; // Import PieChartComponent
import BarChartComponent from './BarChartComponent';
import Loader from "./Loader"; // Import the Loader component
import { AuthContext } from "../../AuthContext";
import { useVessel } from '../../VesselContext'; // Import the context hook
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper from "@mui/material/Popper";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import StarIcon from '@mui/icons-material/Star';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FavoriteVesselsModal from "./FavoriteVesselsModal"; 

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
          marginLeft: "6px",
          display: "flex",
          alignItems: "center",
    
          "&.MuiInputLabel-shrink": {
            top: "-13px",  // Moves label above the border
            transform: "translateY(0)",
            background: "#0F67B1",
            padding: "1px 1px", // Adds small padding so it doesn't touch the border
            margin: "4px 8px",
            fontSize: "12px", // Smaller label when focused
          },
    
          "&.Mui-focused": {
            color: "white",
          },
    
          [theme.breakpoints.down("sm")]: {
            fontSize: "8px", // Adjust for small screens
          },
          
          [theme.breakpoints.down("md")]: {
            fontSize: "10px", // Adjust for small screens
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
          height: "40px", // Adjust height
    
          [theme.breakpoints.down("md")]: {
            height: "36px",
          },
          [theme.breakpoints.down("sm")]: {
            height: "32px",
          },
        }),
        input: {
          fontSize: "12px", // Reduce selected option text size
          padding: "6px 8px", // Reduce padding
          lineHeight: 1.5,
        },
      },
    },
    
    MuiAutocomplete: {
      styleOverrides: {
        root: ({ theme }) => ({
    
          minHeight: "36px",
          [theme.breakpoints.down("md")]: {
            minHeight: "36px",
          },
          [theme.breakpoints.down("sm")]: {
            minHeight: "32px",
          },
        }),
        inputRoot: {
          color: "white",
          fontSize: "12px", // Reduce input text size
          padding: "2px 4px", // Reduce padding inside input
        },
        option: {
          padding: "2px 2px", // Default padding
          fontSize: "12px",
    
          "@media (max-width:600px)": {
            margin:"0px" ,
            padding: "2px 2px !important" , // Reduce padding for small screens
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


function Dashboardcopy() {
  const { role,id} = useContext(AuthContext); 

  const [vesselUpdateTrigger, setVesselUpdateTrigger] = useState(false);
  
  
  const [useFavorites, setUseFavorites] = useState(false); // Default to true for specific roles
  const [vessels, setVessels] = useState([]);
  const [favoriteVessels, setFavoriteVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [filteredFavoriteVessels, setFilteredFavoriteVessels] = useState([]);
    // Function to update favorite vessels (pass this to FavoriteVesselsModal)
    const updateFavoriteVessels = (newFavorites) => {
      setFavoriteVessels(newFavorites);  // Update state with new favorite vessels
      setFilteredFavoriteVessels(newFavorites);
    };

  const [error, setError] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightRow, setHighlightRow] = useState(null);
  
  // New states for counts
  const [shipsAtSeaCount, setShipsAtSeaCount] = useState(0);
  const [shipsAtAnchorageCount, setShipsAtAnchorageCount] = useState(0);
  const [shipsAtBerthCount, setShipsAtBerthCount] = useState(0);
  const [totalShip, setTotalShip] = useState(0);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [loading, setLoading] = useState(false); // New loading state
  const [ports, setPorts] = useState([]); // Store ports data
  const [portnames, setPortnames] = useState([]); // Store ports data
  const [selectedPort, setSelectedPort] = useState(null);
  const [openFavoritesModal, setOpenFavoritesModal] = useState(false);
  const handlePortSelect = (event, newValue) => {
    if(newValue){
    setSelectedPort(newValue);
    } else {
    setSelectedPort(null);

    }
  };
  
  useEffect(() => {
    if (selectedPort && selectedPort.UNLOCODE) {
      setFilteredVessels(vessels.filter(vessel => vessel.port === selectedPort.UNLOCODE));
      setFilteredFavoriteVessels(favoriteVessels.filter(vessel => vessel.port === selectedPort.UNLOCODE));
    } else {
      setFilteredVessels(vessels);
      setFilteredFavoriteVessels(favoriteVessels);
    }
  }, [selectedPort, vessels, favoriteVessels]);

  const handleRowClick = (vessel) => {
    setSelectedVessel(vessel);
    // console.log(vessel);
  };
  
  const { selectedVesselFromChatBot, handleRowClickFromChatBot } = useVessel(); // Get context values and functions

  // Trigger handleRowClick whenever selectedVessel changes
  useEffect(() => {
    if (selectedVesselFromChatBot) {
      handleRowClick(selectedVesselFromChatBot); // Call handleRowClick when selectedVessel is set
    }
  }, [selectedVesselFromChatBot, handleRowClickFromChatBot]); // Dependency array makes sure it only runs when selectedVessel changes

  // Example data for bar chart
const barChartData = [];
const [pieChartData, setPieChartData] = useState([]);


  const handleRowHighlight = (vessel) => {
    setHighlightRow(vessel); // Set the vessel to be highlighted
    setSelectedVessel(vessel);
  };

  const CustomIcon = () => (
    <img src="/ship-berth.png" alt="Ship at berth" style={{ width: "40px", height: "40px" }} />
  );

  const currentVessels = useFavorites ? filteredFavoriteVessels : filteredVessels;
  const vesselsToDisplay = selectedVessel ? [selectedVessel] : currentVessels;
  const calculateMapCenter = () => {
    if (currentVessels.length === 0) return [0, 0];
    const latSum = currentVessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = currentVessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / currentVessels.length, lngSum / currentVessels.length];
  };
  const center = selectedVessel ? [selectedVessel.lat, selectedVessel.lng] : calculateMapCenter();
  const zoom = selectedVessel ? 2 : 6;

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
  const handleRefreshTable = async () => {

    const { trackedVessels, favoriteVessels } = await fetchVessels(role, id);
  
    const transformVesselData = (vessel) => ({
      SpireTransportType: vessel.SpireTransportType || '',
      name: vessel.AIS?.NAME || "-",
      imo: vessel.AIS?.IMO || 0,
      speed: vessel.AIS?.SPEED || 0,
      lat: vessel.AIS?.LATITUDE || 0,
      lng: vessel.AIS?.LONGITUDE || 0,
      heading: vessel.AIS?.HEADING || 0,
      status: vessel.AIS?.NAVSTAT || 0,
      eta: vessel.AIS?.ETA || 0,
      destination: vessel.AIS?.DESTINATION || '',
      zone: vessel.AIS?.ZONE || '',
      port: vessel.AIS?.LOCODE || '',
    });
  
    const transformedTracked = trackedVessels.map(transformVesselData);
    const transformedFavorites = favoriteVessels.map(transformVesselData);
  
    setVessels(transformedTracked);
    setFilteredVessels(transformedTracked);
    setFavoriteVessels(transformedFavorites);
    setFilteredFavoriteVessels(transformedFavorites);
  
    console.log('refreshed');
    console.log(transformedTracked);
  };


const fetchVessels = async (role, userId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch vessels based on role & userId in a single request
    const response = await axios.get(`${baseURL}/api/get-trackedVessels-and-favoriteVessels-by-role`, {
      params: { role, userId }
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};

useEffect(() => {
  fetchPorts();
}, [role,id]);



useEffect(() => {
  fetchVessels(role, id)
    .then(({ trackedVessels, favoriteVessels }) => {

      if (!trackedVessels) return;
     
      // Transform both tracked and favorite vessels for frontend
      const transformVesselData = (vessel) => ({
        SpireTransportType: vessel.SpireTransportType|| '',
        name: vessel.AIS?.NAME || "-",
        imo: vessel.AIS?.IMO || 0,
        speed: vessel.AIS?.SPEED || 0,
        lat: vessel.AIS?.LATITUDE || 0,
        lng: vessel.AIS?.LONGITUDE || 0,
        heading: vessel.AIS?.HEADING || 0,
        status: vessel.AIS?.NAVSTAT || 0,
        eta: vessel.AIS?.ETA || 0,
        destination: vessel.AIS?.DESTINATION || '',
        zone: vessel.AIS?.ZONE || '',
        port: vessel.AIS?.LOCODE || '',
      });
      
      const transformedTrackedVessels = trackedVessels.map(transformVesselData);
      const transformedFavoriteVessels = favoriteVessels.map(transformVesselData);
      
      // Store both in state
      setVessels(transformedTrackedVessels);
      setFilteredVessels(transformedTrackedVessels);

      setFavoriteVessels(transformedFavoriteVessels);
      setFilteredFavoriteVessels(transformedFavoriteVessels);
       
    })
    .catch((err) => {
      console.error("Error fetching vessel data:", err);
      setError(err.message);
    })
   
}, [role,id]);


// ✅ Separate useEffect to update ship counts when favoriteVessels or useFavorites changes
useEffect(() => {
        // Determine which vessels to use
        const selectedVessels = useFavorites ? filteredFavoriteVessels  : filteredVessels;
        // Process data for charts, etc.
        const destinations = [...new Set(selectedVessels.map(vessel => vessel.destination))];
        setDestinationOptions(destinations);
        // console.log(destinations);
        
        const destinationCounts = selectedVessels.reduce((acc, vessel) => {
          acc[vessel.destination] = (acc[vessel.destination] || 0) + 1;
          return acc;
        }, {});

        const updatedPieChartData = Object.entries(destinationCounts).map(([name, value]) => ({ name, value }));
        setPieChartData(updatedPieChartData);

        // Count vessels by status (NAVSTAT)
        setShipsAtSeaCount(selectedVessels.filter(vessel => vessel.status === 0).length);
        setShipsAtAnchorageCount(selectedVessels.filter(vessel => vessel.status === 1 || vessel.status === 2 || vessel.status === 3).length);
        setShipsAtBerthCount(selectedVessels.filter(vessel => vessel.status === 5 || vessel.status === 7).length);
        // console.log(shipsAtBerthCount);
}, [favoriteVessels, vessels, useFavorites, filteredVessels, filteredFavoriteVessels]);
  if (loading) {
    return <Loader />; // Show loader while fetching data
  }
  return (

    <DashboardLayout>
      <DashboardNavbar showButton={true} dropdownOptions={destinationOptions} />
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1} >
      <ThemeProvider theme={theme}>
  <Autocomplete
    PaperProps={{
      sx: {
        borderRadius: "10px",
        overflow: "hidden",
        zIndex: 10000, // Ensure higher priority
        width: "250px", // Increase dropdown width
        minWidth: "250px",
      },
    }}
    PopperComponent={(props) => (
      <Popper {...props} style={{ zIndex: 10000, width: "180px" }} /> // Boost priority
    )}
    options={ports || []}
    getOptionLabel={(option) => (typeof option === "object" && option?.name ? option.name : "")}
    onChange={handlePortSelect}
    renderInput={(params) => (
      <TextField {...params} label="Filter by Port" variant="outlined" size="small" />
    )}
    sx={{
      minWidth: 180, // Default width
      maxWidth: 200,
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        height: "34px", // Reduce height
        fontSize: "12px", // Reduce selected option size
        padding: "4px 6px", // Reduce input padding
      },
      "@media (max-width: 600px)": {
        minWidth: 180, // Smaller width on mobile
        "& .MuiOutlinedInput-root": {
          height: "34px", // Adjust height for small screens
        },
        "& .MuiInputLabel-root": {
          fontSize: "10px", // Reduce label size
        },
      },
    }}
  />
</ThemeProvider>

        <>
  <Button 
    variant="contained" 
    color="white" 
    size="small"
    sx={{ px: 2, py: 1, borderRadius: "8px" }}
    onClick={() => setUseFavorites(!useFavorites)}
  >
    {useFavorites ? "Show Tracked Vessels": "Show Favorite Vessels" }
  </Button>
 <Tooltip 
  title="Favorite Vessels" 
  arrow
  PopperProps={{
    modifiers: [
      {
        name: "arrow",
        enabled: true,
        options: {
          element: "[data-popper-arrow]",
        },
      },
    ],
  }}
  componentsProps={{
    tooltip: {
      sx: {
        bgcolor: "white", // Set background color to white
        color: "black", // Set text color to black
        boxShadow: 1, // Optional: add subtle shadow
        fontSize: "12px", // Adjust font size
      },
    },
    arrow: {
      sx: {
        color: "white", // Set arrow color to match background
      },
    },
  }}
>
 <Button 
  variant="contained" 
  color="white" 
  size="small"
  sx={{ 
    height: "34px", 
    minWidth: "34px", 
    padding: 0, 
    borderRadius: "8px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center"
  }}
  onClick={() => setOpenFavoritesModal(true)}
>
  <i className="fa-solid fa-star" style={{color: " #FFC100",fontSize:"17px"}}/>
</Button>
</Tooltip>
        {/* Favorites Modal */}
            <FavoriteVesselsModal
              open={openFavoritesModal}
              onClose={() => setOpenFavoritesModal(false)}
              vessels={vessels}
              favoriteVessels={favoriteVessels || []}
              updateFavoriteVessels={updateFavoriteVessels}
            />
      </>
  
    </Box>
      <ArgonBox py={2}>
        <Grid container spacing={3} mb={0}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Ships at Sea"
              count={shipsAtSeaCount}
              icon={{ color: "info", component: <i className="fa fa-compass" /> }}
              percentage={{ color: "success", count: "+55%", text: "since yesterday" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Ships at Anchorage"
              count={shipsAtAnchorageCount}
              icon={{ color: "error", component: <i className="fa fa-anchor" /> }}
              percentage={{ color: "success", count: "+3%", text: "since last week" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Ships at Berth"
              count={shipsAtBerthCount}
              icon={{ color: "warning", component: <CustomIcon /> }}
              percentage={{ color: "error", count: "-2%", text: "since last quarter" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Total Ships"
              count={currentVessels.length}
              icon={{ color: "primary", component: <i className="fa fa-ship" /> }}
              percentage={{ color: "success", count: "+5%", text: "than last month" }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={0} mt={6}>
          <Grid item xs={12} md={6} lg={12}>
            <DashCard
              title="Vessels Subscribed"
              count="20"
              icon={{ color: "info", component: <i className="fa fa-database" /> }}
              percentage={{ color: "success", count: "+55%", text: "since yesterday" }}
              onRefresh={handleRefreshTable}
              onHighlight={handleRowHighlight}
              vessels={currentVessels}
              setVessels={setVessels}
              setFilteredVessels={setFilteredVessels}
              onRowClick={handleRowClick}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={1}>
     
               {/* Card for Map */}
            <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        backgroundColor: "#ffffff",
                        borderRadius: "17px",
                        boxShadow: 1,
                        padding: 2, // Increased padding for better spacing
                        paddingBottom: 1, // Slight padding at bottom to prevent overlap
                        height: "550px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
              <CardContent
                sx={{
                  backgroundColor: "#ffffff",
                  padding: 1, // Added slight padding for content spacing
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={vesselsToDisplay}
                  selectedVessel={selectedVessel}
                  ports={ports}
                  selectedPort={selectedPort}
                  // onVesselDelete={handlevesselDelete}
                  
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Card for Table */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "17px",
                boxShadow: 1,
                padding: 2,
                height: "550px",
              }}
            >
              <CardContent
                sx={{
                  backgroundColor: "#ffffff",
                  padding: 0,
                  height: "100%",
                }}
              >
                <VesselDetailsTable
                  key={refreshKey}
                  vessels={currentVessels}
                  onRowClick={handleRowClick}
                  highlightRow={highlightRow}
                  setVessels={setVessels}
                  setFilteredVessels={setFilteredVessels}
                  // setSelectedVessel={setSelectedVessel}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Conditionally render Pie Chart */}
        {currentVessels.length > 0 && (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '500px' }}>
                <CardContent sx={{  width: '100%' }}>
                  <PieChartComponent data={pieChartData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '500px' }}>
                <CardContent sx={{ width: '100%' }}>
                <BarChartComponent data={barChartData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        <br></br>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboardcopy;