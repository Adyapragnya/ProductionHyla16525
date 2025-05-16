import React, { useEffect, useState,useContext } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard1 from "examples/Cards/StatisticsCards/DetailedStatisticsCard1";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MyMapComponent from "./MyMapComponent";
import Timeline from "./Timeline";
import { AuthContext } from "../../AuthContext";
import Loader from "./Loader";
import VoyageTabel from "./VoyageTabel";
import { Button, Box, Dialog, DialogTitle, DialogContent,DialogActions } from "@mui/material";
import { format} from 'date-fns-tz';
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import VoyageTableLeftsideMap from "./VoyageTableLeftsideMap";


import axios from 'axios';
import EmissionDetails from "./EmissionDetails";


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


const CreateVoyageModal = ({ vessels, ports, open, onClose, onCreateVoyage }) => {
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);

  const handleSubmit = () => {
    if (selectedVessel && selectedPort) {
      console.log("Selected Vessel:", selectedVessel);
    console.log("Selected Port:", selectedPort);
      onCreateVoyage({ vessel: selectedVessel, port: selectedPort });
      onClose(); // Close modal after submission
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create JIT Voyage</DialogTitle>
      <DialogContent>
        {/* Vessel Selection */}
        <ThemeProvider theme={theme}>
        <Box sx={{ my: 2 }}>
          <Autocomplete
            options={vessels}
            getOptionLabel={(option) => option.AIS.NAME || ""}
            value={selectedVessel}
            onChange={(event, newValue) => setSelectedVessel(newValue)}
            renderInput={(params) => 
              <TextField
              {...params}
              label="Select Vessel"
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "gray !important", // Default label color
                
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: "gray", // Default border color
                  color: "gray !important", // Default label color

                  },
                  "&:hover fieldset": {
                    borderColor: "darkgray", // Border color on hover
                    color: "gray !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "gray", // Border color when focused
                    background: "white !important",
                      color: "gray !important",

                  },
                },
                "& .MuiInputLabel-root": {
                  color: "gray !important", // Default label color
                  background: "white !important",
                  padding: "0 4px",
                  transition: "all 0.2s ease-in-out",
                },
                "&.MuiInputLabel-shrink": {
                  background: "white !important", // Background white when label shrinks
                  padding: "0 4px",
                  color: "gray !important", // Text color gray when shrunk
                },
                "&.Mui-focused": {
                  background: "white !important",
                  color: "gray !important",
                },
              }}
            />
         
            }
          />
        </Box>

        {/* Port Selection */}
        <Box sx={{ my: 2 }}>
          <Autocomplete
            options={ports}
            getOptionLabel={(option) => option.name || ""}
            value={selectedPort}
            onChange={(event, newValue) => setSelectedPort(newValue)}
            renderInput={(params) => 
              <TextField
              {...params}
              label="Select Port"
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "gray !important", // Default label color
                
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: "gray", // Default border color
                  color: "gray !important", // Default label color

                  },
                  "&:hover fieldset": {
                    borderColor: "darkgray", // Border color on hover
                    color: "gray !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "gray", // Border color when focused
                    background: "white !important",
                      color: "gray !important",

                  },
                },
                "& .MuiInputLabel-root": {
                  color: "gray !important", // Default label color
                  background: "white !important",
                  padding: "0 4px",
                  transition: "all 0.2s ease-in-out",
                },
                "&.MuiInputLabel-shrink": {
                  background: "white !important", // Background white when label shrinks
                  padding: "0 4px",
                  color: "gray !important", // Text color gray when shrunk
                },
                "&.Mui-focused": {
                  background: "white !important",
                  color: "gray !important",
                },
              }}
            />
            }
          />
        </Box>
        </ThemeProvider>
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!selectedVessel || !selectedPort}>
          Create Voyage
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ✅ Add PropTypes Validation
CreateVoyageModal.propTypes = {
  vessels: PropTypes.array.isRequired,
  ports: PropTypes.array.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateVoyage: PropTypes.func.isRequired,
};


function Default() {
  const { vesselId } = useParams(); // Retrieve vesselId from URL
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const { role, id } = useContext(AuthContext);
  const [loading, setloading]=useState(false);
  const [error,setError]= useState("");
  const [events, setEvents] = useState([]);
  const [showVoyageTable, setShowVoyageTable] = useState(false);
  const [voyageIMOS,setVoyageIMOS] = useState([]);
  const [allVoyages,setAllVoyages] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [ports, setPorts] = useState([]);
  const [allPorts, setAllPorts] = useState([]);
  // const [searchVessels, setSearchVessels] = useState([]);
  const [searchVesselsOptions, setSearchVesselsOptions] = useState([]);

  const [voyageData, setVoyageData] = useState([]);
  const [filteredVoyages, setFilteredVoyages] = useState([]); // Store filtered voyages

  // Fetch voyage data on component mount
  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-voyages`);
    

        setVoyageData(response.data);
        setFilteredVoyages(response.data); 
        console.log('qqqqqqqq',response.data);




              
              // Extract only the IMO values from the response data
              const imoValues = response.data.map(voyage => voyage.IMO);
              
              // Set the IMO values in the state
              setVoyageIMOS(imoValues);
              
 
 
              
              
                const ports = response.data.map(voyage => voyage.port); // Extract only the port objects
              
                // Remove duplicate ports by checking the port name
                const uniquePorts = ports.filter(
                (port, index, self) => 
                port && index === self.findIndex(p => p?.name === port.name)
                );
              
                setPorts(uniquePorts);

              //   // 

              //   const IMOS = [...new Set(response.data.map(voyage => voyage.IMO))];// Extract only the port objects

              //   const matchedVessels = vessels
              //   .filter(vessel => IMOS.includes(vessel.AIS.IMO)) // Find matching IMO values
              //   .map(vessel => vessel.AIS.NAME); // Extract name field
              // // console.log(vessels);
              // // console.log(matchedVessels); 
                
              //   setSearchVessels(matchedVessels);
              
              




      } catch (error) {
        console.error("Error fetching voyages:", error);
      }
    };

    const fetchPorts = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-ports`);
    
        setAllPorts(response.data);

      } catch (error) {
        console.error("Error fetching ports:", error);
      }
    };

    fetchVoyages();
    fetchPorts();
  }, []);
  

  
  useEffect(() => {
    if (!selectedVessel && !selectedPort) {
      setFilteredVoyages(voyageData); // ✅ Show all data if no filters are selected
      return;
    }

    let data = voyageData;

    if (selectedPort) {
      data = data.filter((vessel) => vessel.port.name === selectedPort.name);
    }

    if (selectedVessel) {
      data = data.filter((vessel) => vessel.IMO === selectedVessel.AIS.IMO);
    }

    setFilteredVoyages(data); // Store filtered results
  }, [ selectedVessel, selectedPort]);

  
// useEffect(() => {
//   const fetchVoyages = async () => {
//   try {
  
//   const baseURL = process.env.REACT_APP_API_BASE_URL;
  
//   const response = await axios.get(`${baseURL}/api/get-voyages`);

//   setAllVoyages(response.data);
//   // Extract only the IMO values from the response data
//   const imoValues = response.data.map(voyage => voyage.IMO);
  
//   // Set the IMO values in the state
//   setVoyages(imoValues);
  
 
 
 
//   const ports = response.data.map(voyage => voyage.port); // Extract only the port objects
 
//   // Remove duplicate ports by checking the port name
//   const uniquePorts = ports.filter(
//   (port, index, self) => 
//   port && index === self.findIndex(p => p?.name === port.name)
//   );
 
//   setPorts(uniquePorts);

//   // 

//   const IMOS = [...new Set(response.data.map(voyage => voyage.IMO))];// Extract only the port objects

//   const matchedVessels = vessels
//   .filter(vessel => IMOS.includes(vessel.AIS.IMO)) // Find matching IMO values
//   .map(vessel => vessel.AIS.NAME); // Extract name field
// console.log(vessels);
// console.log(matchedVessels); 
  
//   setSearchVessels(matchedVessels);
 
 
 
  
//   } catch (error) {
//   console.error('Error fetching voyages:', error);
//   }
//   };
//   fetchVoyages();
//   }, [selectedPort]);


// Handle port selection
const handlePortSelect = (event, value) => {

  setSelectedVessel(null);
if (!value) {
  setSelectedPort(null);
  

  return;
}

console.log(vessels);
const portData = ports.find(port => port.name === value.name);
setSelectedPort(portData || null);

  console.log(voyageData);
  // Get matching voyages
  const matchedVoyages = voyageData.filter(voyage => voyage.port.name === value.name);

  // Extract unique IMO values
  const uniqueIMOs = [...new Set(matchedVoyages.map(voyage => voyage.IMO))];

  const matchedVessels = vessels
  .filter(vessel => uniqueIMOs.includes(vessel.AIS.IMO)) // Find matching IMO values
   // Extract name field

  console.log(matchedVessels); 
  


  setSearchVesselsOptions(matchedVessels);
 
  console.log(vessels)


};


function handleSelect(event, value) {
  if (!value) {
    setSelectedVessel(null);
    return;
  }

  const vesselData = vessels.find(vessel => vessel.AIS.NAME === value.AIS.NAME);
  setSelectedVessel(vesselData || null);
}


const fetchVessels = async (role, userId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch vessels based on role & userId in a single request
    const response = await axios.get(`${baseURL}/api/get-vessels-by-role`, {
      params: { role, userId }
    });

    setVessels(response.data) ;
  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};


useEffect(() => {
  
  fetchVessels(role, id);

}, [role,id,vessels]);



  const destination = selectedVessel?.AIS?.DESTINATION || "-";
  const speed = selectedVessel?.AIS?.SPEED ? `${selectedVessel.AIS.SPEED} knots` : "-";
  const eta = selectedVessel?.AIS?.ETA || "-";
  const zone = selectedVessel?.AIS?.ZONE || "-";

// Simulated function that fetches new event data (could be replaced by API calls)
const fetchNewEvent = () => {
  return new Promise((resolve) => {
      setTimeout(() => {
          const eventId = (events.length + 1).toString();
          const newEvent = {
              id: eventId,
              title: `Event ${eventId}`,
              date: new Date().toLocaleString(),
              description: `New event added: ${eventId}`
          };

          // Randomly decide to return new event or null (to simulate no new events)
          const hasNewEvent = Math.random() > 0.5; // 50% chance to get a new event
          resolve(hasNewEvent ? newEvent : null);
      }, 2000); // Simulate a delay for fetching
  });
};

if (loading) {
  return <Loader/>;
}


const handleToggleView = () => {
  setShowVoyageTable((prev) => !prev);
};

const handleCreateVoyage = async ({vessel,port}) => {
  if (!vessel || !port) {
    alert("Please select a vessel and a port.");
    return;
  }


  try {

      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      const newVoyage = {
        name: vessel.AIS.NAME,
        port: port.name,
        IMO: vessel.AIS.IMO,
        ETB: 0,
        BerthName: "0",
        ATB: 0,
        A_Berth: "0",
        status: "0",
        isActive: 1,
        ETA: 0,
        SPEED: 0
      };
   
  await axios.post(`${baseURL}/api/create-voyages`, newVoyage);


    Swal.fire({
      title: "Success!",
      text: "Voyage Created successfully.",
      icon: "success",
      confirmButtonText: "OK",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Failed to Create Voyage.",
      icon: "error",
      confirmButtonText: "Retry",
    });
    console.error("Error:", error);
  }
};


 
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={2}>
    

      <Box 
  sx={{ 
    display: "flex", 
    flexWrap: "wrap", // Allows wrapping on small screens
    gap: 2, 
    alignItems: "center", 
    justifyContent: { xs: "center", sm: "flex-start" }, // Center items on small screens
  }}
>
   <ThemeProvider theme={theme}>
 {/* Port Search */}
 <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 250 } }}>

 <Autocomplete
   PaperProps={{
    sx: {
      borderRadius: "10px", // Rounds the dropdown menu
      overflow: "hidden", // Ensures no clipping
    },
  }}
 options={ports} // Assuming you have a ports data array
 getOptionLabel={(option) => option.name || ""}
 value={selectedPort}
 onChange={handlePortSelect}
 renderInput={(params) => (
 <TextField {...params} label="Select Port" variant="outlined" />
 )}
 sx={{ 
  flex: 1, 
  width: "100%",
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
}} 
 />
 </Box>

 {/* Vessel Search (Conditional) */}
 {selectedPort && (
   <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 250 } }}>

 <Autocomplete
  PaperProps={{
    sx: {
      borderRadius: "10px", // Rounds the dropdown menu
      overflow: "hidden", // Ensures no clipping
    },
  }}
 options={searchVesselsOptions}
 getOptionLabel={(option) => option.AIS.NAME || ""}
 value={selectedVessel}
 onChange={handleSelect}
 renderInput={(params) => (
 <TextField {...params} label="Select Vessel" variant="outlined" />
 )}
 sx={{ 
  flex: 1, 
  width: "100%",
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
}} 
 />
 </Box>
 )}

</ThemeProvider>

  {/* Create Voyage Button */}
  <Button
    variant="contained"
    color= "white"
    onClick={() => setModalOpen(true)}
    // disabled={!selectedVessel}
    sx={{
      minWidth: { xs: "100%", sm: 180 }, // Full width on small screens
      height: { xs: 32, sm: 36, md: 44 }, // Responsive height
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "10px",
      backgroundColor: "white",
      color: "primary.main",
      border: "1px solid",
      borderColor: "primary.main",
     
    }}
  >
    <i className="fa-solid fa-plus"></i>&nbsp; Create Voyage
  </Button>

      {/* Modal Component */}
      <CreateVoyageModal 
        vessels={vessels} 
        ports={allPorts} 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onCreateVoyage={handleCreateVoyage} 
      />
 </Box>


     
      

        {selectedVessel && (
        <Grid container spacing={3} mb={3} mt={1}>
          <Grid item xs={12} md={6} lg={12}>
            <DetailedStatisticsCard1 vessel={selectedVessel} />
          </Grid>
        
       
            <>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Port"
                  count={destination}
                  icon={{ color: "info", component: <i className="fa fa-ship" /> }}
                  percentage={{ color: "success", count: "+3%", text: "since yesterday" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Speed"
                  count={speed}
                  icon={{ color: "info", component: <i className="fa fa-gauge" /> }}
                  percentage={{ color: "success", count: "+3%", text: "since last week" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="ETA"
                  count={eta}
                  icon={{ color: "info", component: <i className="fa fa-map" /> }}
                  percentage={{ color: "error", count: "-2%", text: "since last quarter" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Zone"
                  count={zone}
                  icon={{ color: "info", component: <i className="fa fa-map-pin" /> }}
                  percentage={{ color: "success", count: "+5%", text: "than last month" }}
                />
              </Grid>
            </>
         
        </Grid>
         )}


        {selectedVessel && (
        <Grid container spacing={3} justifyContent="center" alignItems="flex-start" style={{ height: '100%' }}>
  <Grid item xs={12} md={4} lg={4} style={{ height: '100%' }}>
    <div style={{ borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', height: '100%' }}>
      <VoyageTableLeftsideMap
        selectedVessel={selectedVessel}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '100%' }}
      />
    </div>
  </Grid>
  <Grid item xs={12} md={8} lg={8} style={{ height: '100%' }}>
    <div style={{ borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', height: '100%' }}>
      <MyMapComponent
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '100%' }}
      />
    </div>
  </Grid>
</Grid>

)}



 <Grid container spacing={0} mt={3}>
 <Grid item xs={12} md={12}>
 <Card sx={{ padding: 1, position: "relative", paddingBottom: "15px" }}>
 <CardContent>
 {/* Container for Header and Button */}
 <div style={{
 display: "flex", 
 justifyContent: "space-between", 
 alignItems: "center", 
 flexWrap: "wrap"
 }}>
 {/* Header */}
 <Typography variant="h3" color="#344767" style={{ margin: "0 8px" }} gutterBottom>
 JIT OPTIMIZATION
 </Typography>
 
 {/* Button */}
 <Button
 variant="contained"
 color="primary"
 onClick={handleToggleView}
 style={{
 color: "#fff",
 display: "flex",
 alignItems: "center",
 marginTop: "8px"
 }}
 >
 <i className="fa-solid fa-wand-magic-sparkles"></i>&nbsp; 
 {showVoyageTable ? "Show Emission Details" : "Calculate JIT"}
 </Button>
 </div>
 </CardContent>

 {/* Conditional rendering of components */}
 {showVoyageTable ? (
 <VoyageTabel data={filteredVoyages}/>
 ) : (
 <EmissionDetails selectedVessel={selectedVessel} selectedPort={selectedPort} />
 )}
</Card>

 </Grid>
 </Grid>
 

      </ArgonBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Default;