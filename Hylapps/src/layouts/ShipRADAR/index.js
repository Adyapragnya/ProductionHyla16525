import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Tabs, Tab,Box } from "@mui/material";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Vesseleighthours from "./Vesseleighthours";
import Vesseltwentyfourhours from "./Vesseltwentyfourhours";
import VesselSixhours from "./VesselSixhours";
import ShipsInport from "./shipsinport";
import Loader from "./Loader";
import { AuthContext } from "../../AuthContext";
import ShipsInPortContainer from './ShipsInPortContainer'; 
import OpsRadar from './OpsRadar';
import Select from 'react-select';
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Popper from "@mui/material/Popper";

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




function Geofence() {
  const [vessels, setVessels] = useState([]);
  const [originalVessels, setOriginalVessels] = useState([]);

  
  const [selectedPort, setSelectedPort] = useState([]);

  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselEntries, setVesselEntries] = useState({});
  const [loading, setLoading] = useState(false);
  // const [selectedTab, setSelectedTab] = useState(0);
  const [tabAnimation, setTabAnimation] = useState({ opacity: 1 });
  const { role,id} = useContext(AuthContext); 
  const [opsData, setOpsData] = useState([]);
  const [ports, setPorts] = useState([]); // Store ports data
  const [portnames, setPortnames] = useState([]); // Store ports data

  const [originalDataSource, setOriginalDataSource] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  


  const handleTabChange = (event, newValue) => {
    // Start fading out
    setTabAnimation({ opacity: 0, transition: "opacity 0.4s ease-in-out" });
    setTimeout(() => {
      // Switch tabs after fade-out
      setSelectedTab(newValue);
      setTabAnimation({ opacity: 1, transition: "opacity 0.4s ease-in-out" }); // Fade in
    }, 400); // Match the fade-out duration
  };

  const handleRowClick = (vessel) => {
    const selected = vessels.find((v) => v.name === vessel.name);
    if (selected) {
      setSelectedVessel(selected);
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel
    ? [selectedVessel.lat, selectedVessel.lng]
    : calculateMapCenter();
  // const zoom = selectedVessel ? 10 : 6;
  


  
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

    // console.log('abcddddddddddddddddddd',response.data);

    // Extract IMO values from the response
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

// const fetchVessels = async (role, userId) => {
//   try {
//     // Fetch the tracked vessels for the user first
//     const trackedByUser = await fetchTrackedVesselsByUser(userId);
//     // console.log(trackedByUser);

//     // Ensure tracked vessels have a valid IMO and extract them
//     const trackedIMO = trackedByUser.filter(vessel => vessel.IMO).map(vessel => vessel.IMO);

//     const baseURL = process.env.REACT_APP_API_BASE_URL;
//     // Now fetch all vessels
   
//     const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
    
//     const allVessels = response.data;
    
//    // Initialize an empty array to store the filtered vessels
//     const filteredVessels = [];


//       if (role === 'hyla admin') {
//         // For 'hyla admin', return all vessels whose IMO is in the tracked IMO list
//         // filteredVessels.push(...allVessels); // Spread allVessels into filteredVessels to avoid nested array
//       } else if (role === 'organization admin' || role === 'organizational user') {
      

//         // Now, you need to fetch the IMO values for the user
//         const vesselsFiltered = await fetchVesselIMOValues(userId); // Await this async function
// // vessel based on Ops start

// const extractOrgPart = (value) => {

//   let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
  
//   return orgId;
// };

// const filteredOpsData = opsData.filter((entry) => entry.OrgId === extractOrgPart(id));

// const finalVessels = vesselsFiltered.filter((vessel) =>
//   filteredOpsData.some((op) => op.IMO === vessel.IMO)
// );

// // console.log(finalVessels)

// // vessel based on Ops end


// // start

// // const getFilteredVessels = (timeRange) => {
// //   const filtered = finalVessels.filter((vessel) => {
// //     // Filter based on AisPullGfType
// //     switch (timeRange) {
// //       case "inport":
// //         return vessel.AisPullGfType === "inport";
// //       case "6hours":
// //         return vessel.AisPullGfType === "terrestrial";
// //       case "24hours":
// //         return vessel.AisPullGfType === "boundary";
// //       case "beyond24":
// //         return vessel.AisPullGfType !== "inport" &&  vessel.AisPullGfType !== "terrestrial" && vessel.AisPullGfType !== "boundary";
// //       default:
// //         return true; // Default behavior (if no filtering needed)
// //     }
// //   });

// //   // Log the filtered vessels
// //   console.log(`Filtered vessels for ${timeRange}:`, filtered);
// //   return filtered;
// // };


// // const finalfilteredVessels = getFilteredVessels(
// //   selectedTab === 0
// //     ? "inport"
// //     : selectedTab === 1
// //     ? "6hours"
// //     : selectedTab === 2
// //     ? "24hours"
// //     : selectedTab === 3
// //     ? "beyond24"
// //     : "beyond24" // Default behavior
// // );
  

// // end 


//         // Check if the vessel IMO is in the fetched IMO values
//         filteredVessels.push(...finalVessels); // to avoid array inside array nested
       
        
//       } else if (role === 'guest') {
//         // For 'guest', filter vessels based on loginUserId
     

//             // Now, you need to fetch the IMO values for the user
//             const vesselsFiltered = await fetchVesselById(userId); // Await this async function


//             const filteredOpsData = opsData.filter((entry) => entry.loginUserId === id);

//             const finalVessels = vesselsFiltered.filter((vessel) =>
//               filteredOpsData.some((op) => op.IMO === vessel.IMO)
//             );
            
//             // console.log(finalVessels)
            
//             // vessel based on Ops end
            
            
//             // start
            
//             // const getFilteredVessels = (timeRange) => {
//             //   const filtered = finalVessels.filter((vessel) => {
//             //     // Filter based on AisPullGfType
//             //     switch (timeRange) {
//             //       case "inport":
//             //         return vessel.AisPullGfType === "inport";
//             //       case "6hours":
//             //         return vessel.AisPullGfType === "terrestrial";
//             //       case "24hours":
//             //         return vessel.AisPullGfType === "boundary";
//             //       case "beyond24":
//             //         return vessel.AisPullGfType !== "inport" &&  vessel.AisPullGfType !== "terrestrial" && vessel.AisPullGfType !== "boundary";
//             //       default:
//             //         return true; // Default behavior (if no filtering needed)
//             //     }
//             //   });
            
//             //   // Log the filtered vessels
//             //   console.log(`Filtered vessels for ${timeRange}:`, filtered);
//             //   return filtered;
//             // };
            
            
//             // const finalfilteredVessels = getFilteredVessels(
//             //   selectedTab === 0
//             //     ? "inport"
//             //     : selectedTab === 1
//             //     ? "6hours"
//             //     : selectedTab === 2
//             //     ? "24hours"
//             //     : selectedTab === 3
//             //     ? "beyond24"
//             //     : "beyond24" // Default behavior
//             // );
              

//             filteredVessels.push(...finalVessels); // to avoid array inside array nested



//       }else{
//         console.log('not found')
//       }
    
    

  

//     // console.log('Filtered Vessels:', finalVessels);
//     return filteredVessels;

//   } catch (error) {
//     console.error("Error fetching vessels:", error);
//     return [];
//   }
// };



const fetchVessels = async (role, userId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch vessels based on role & userId in a single request
    const response = await axios.get(`${baseURL}/api/get-vessels-by-role-ops-and-sales`, {
      params: { role, userId }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};



useEffect(() => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;


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

    const fetchOpsData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const opsDataResponse = await axios.get(`${baseURL}/api/get-uploaded-ops-data`);

        setOpsData(opsDataResponse.data);
        console.log(opsDataResponse);
      } catch (error) {
        console.error('Error fetching ops data:', error);
      }
    };
    
  
    
      fetchOpsData();
      fetchPorts();
 
}, [role,id]);

  
console.log("Fetching data for role:", role, "and id:", id);


useEffect(() => {
  if (!role || !id || opsData.length === 0) {
    console.warn("Skipping fetch, role, id, or opsData is missing.");
    return;
  }
const fetchData = async () => {
  try {
    console.log("Fetching vessels...");
    const fetchedVessels = await fetchVessels(role, id);
   
    const extractOrgPart = (value) => {

      let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
      
      return orgId;
    };
    
    const filteredOpsData = opsData.filter((entry) => entry.OrgId === extractOrgPart(id));

    console.log("Fetched ops:", filteredOpsData);

const finalVessels = fetchedVessels.filter((vessel) =>
  filteredOpsData.some((op) => op.IMO === vessel.IMO)
);

console.log("Fetched vess:", finalVessels);


    const transformedData = finalVessels.map((vessel) => ({
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
      GeofenceStatus: vessel?.GeofenceStatus || '',
      AisPullGfType: vessel?.AisPullGfType || '',
    }));
    console.log("Transformed data:", transformedData);
    setVessels(transformedData);
    setOriginalVessels(transformedData);
  } catch (err) {
    console.error("Error fetching vessel data:", err);
    // setError(err.message);
  }
};

fetchData();
}, [role, id, opsData]); 




const formatEntries = (opsData = [], vessels = []) => {

  // const finalData = trackedVessels // Only show vessels in port

  return opsData
    .map(op => {
      // Find the matching tracked vessel by IMO number
      const matchingVessel = vessels.find(vessel => vessel.imo === op.IMO);

      // If a matching vessel is found, merge the relevant data
      if (matchingVessel) {

      
        return {
          
          IMO: op.IMO || '-',
          CaseId: op.CaseId || '-',
          Agent: op.Agent || '-',
          AgentName: op.AgentName || '-',
          Info1: op.Info1 || '-',
          OpsETA: op.ETA || '-',

          AISName: matchingVessel?.name || '-',
        //   IMO: matchingVessel.AIS?.IMO || '-',
          ETA: matchingVessel?.eta || '-',
          Destination: matchingVessel?.destination || '-',
          RegionName: matchingVessel.GeofenceStatus || '-',
            // Transform AisPullGfType value based on the condition
          AisPullGfType: (() => {
            const value = matchingVessel?.AisPullGfType || '-';
            switch (value) {
              case 'inport':
                return 'Within 6hrs';
              case 'terrestrial':
                return 'Within 12hrs';
              case 'boundary':
                return 'Within 24hrs';
              case '-':
              default:
                return 'Beyond 24hrs';
            }
          })(),
         
          createdAt: op.createdAt 
            ? new Date(op.createdAt).toISOString().split('T')[0] 
            : '-', // Extract only the date portion
        };
      }
      // Return a placeholder if no matching vessel is found
      
      return {
        // commented toremove ops data when not matching(opt)

        IMO: op.IMO || '-',
        CaseId: op.CaseId || '-',
        Agent: op.Agent || '-',
        AgentName: op.AgentName || '-',
        Info1: op.Info1 || '-',
        OpsETA: op.ETA || '-',


        // no need tracked data when not matching
        AISName: matchingVessel?.name || '-',
        IMO: matchingVessel?.imo || '-',
        ETA: matchingVessel?.eta || '-',
        Destination: matchingVessel?.destination || '-',
        RegionName: matchingVessel?.GeofenceStatus || '-',
        AisPullGfType: (() => {
          const value = matchingVessel?.AisPullGfType || '-';
          switch (value) {
            case 'inport':
              return 'Within 6hrs';
            case 'terrestrial':
              return 'Within 12hrs';
            case 'boundary':
              return 'Within 24hrs';
            case '-':
            default:
              return 'Beyond 24hrs';
          }
        })(),
       
        createdAt: op.createdAt 
          ? new Date(op.createdAt).toISOString().split('T')[0] 
          : '-', // Extract only the date portion
      };
    })
    // .sort(sortPriority); // Apply sorting based on GeofenceType
};

  useEffect(() => {
    if (opsData.length > 0 && vessels.length > 0) {

     

      
  if (role === 'hyla admin') {


  } else if (role === 'organization admin' || role === 'organizational user') {
 
    const extractOrgPart = (value) => {

      let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
      
      return orgId;
    };
    

    // const filteredOpsData = opsData.filter((entry) => entry.OrgId === extractOrgPart(id));

    const filteredOpsData = opsData.filter((entry) => entry.loginUserId === id);

    const formattedData = formatEntries(filteredOpsData, vessels);
    // console.log(formattedData);


    const transformedData = formattedData.map((row) => {
      let transformedAisPullGfType;
      switch (row.AisPullGfType) {
        case 'inport':
          transformedAisPullGfType = 'Within 6hrs';
          break;
        case 'terrestrial':
          transformedAisPullGfType = 'Within 12hrs';
          break;
        case 'boundary':
          transformedAisPullGfType = 'Within 24hrs';
          break;
        case '-':
        default:
          transformedAisPullGfType = 'Beyond 24hrs';
          break;
      }
      return {
        ...row,
        AisPullGfType: transformedAisPullGfType, // Update AisPullGfType field
      };
    });
   
    setDataSource(formattedData); 
    setOriginalDataSource(formattedData);


 } else if (role === 'guest') {

  const filteredOpsData = opsData.filter((entry) => entry.loginUserId === id);
  console.log(filteredOpsData);

  const formattedData = formatEntries(filteredOpsData, vessels);
  console.log(formattedData);
 
  setDataSource(formattedData); 
  setOriginalDataSource(formattedData);

   
 }


     
     
    }
  }, [opsData,originalVessels]);



  const handlePortSelect = (event, value) => {
    if (!value) {
      // If no port is selected, reset to original data
    setSelectedPort( null);
      // console.log(originalVessels);
      setVessels(originalVessels);
      setDataSource(originalDataSource);

      // setAllVessels(originalVessels);
      // setAllRows(originalRows);
      return;
    }
    setSelectedPort(value );
    
    console.log(originalVessels);
  
    // // Filter vessels based on AIS.DESTINATION
    const filteredVessels = originalVessels.filter(
      (vessel) => vessel.destination === value.UNLOCODE
    );

    // console.log(filteredVessels);


    const filteredDataSource = originalDataSource.filter(
      (row) => row.Destination === value.UNLOCODE
    )

  
    // // Filter allVessels based on AIS.DESTINATION
    // const filteredAllVessels = originalVessels.filter(
    //   (vessel) => vessel.AIS?.DESTINATION === value.UNLOCODE
    // );

  
    // // Filter allRows based on AIS.DESTINATION
    // const filteredRows = originalRows.filter(
    //   (row) => row.AIS?.DESTINATION === value.UNLOCODE
    // );
  
  
    // Update state with filtered data
    console.log(filteredDataSource);
    setVessels(filteredVessels);
    setDataSource(filteredDataSource);
    // setAllVessels(filteredAllVessels);
    // setAllRows(filteredRows);



    // const finalSalesData = originalFilteredSales.filter(entry =>entry.Destination === value.UNLOCODE);
    // setFilteredSales(finalSalesData);

      

  };

  useEffect(() => {
    console.log(dataSource);
  }, [dataSource]);

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />

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
                                getOptionLabel={(option) => {
                                  // console.log("Option in getOptionLabel:", option);
                                  return typeof option === "object" && option?.name ? option.name : "";
                                }}
                                onChange={handlePortSelect}
                                renderInput={(params) => (
                                  <TextField {...params} label="Select Port" variant="outlined" />
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
      
      </Box>
      
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              {/* <CardContent> */}
             
                <MyMapComponent
                  // zoom={zoom}
                  ports={ports}
                  selectedPort={selectedPort}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                />
              {/* </CardContent> */}
            </Card>
          </Grid>
        </Grid>

        {/* <br />
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          sx={{
            background: "#D4F6FF",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Tab label="In Port" />
          <Tab label="Within 6 Hours" />
          <Tab label="Within 24 Hours" />
          <Tab label="Beyond 24 Hours" />
        </Tabs> */}
        

        {/* <div style={{borderRadius: "25px"}}> */}
          <Grid   mt={3}>
            {/* {selectedTab === 0 && ( */}

              {/* <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                > */}
                 
                  <ShipsInport
                    dataSource={dataSource}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                    style={{borderRadius: "25px"}}
                  />

                {/* </Card>
              </Grid> */}

            {/* )} */}

            {/* {selectedTab === 1 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                 
                  <VesselSixhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 2 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                 
                  <Vesseltwentyfourhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 3 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
               
                  <Vesseleighthours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )} */}

          </Grid>
        {/* </div> */}




      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;
