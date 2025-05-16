/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import axios from "axios";
import {Button, Tab, Tabs, Box } from "@mui/material";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
import { ToastContainer, toast } from 'react-toastify'; // Import Toast components
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import SalesRadar from './SalesRadar'
import ISMTable from './ISMTable'
import { AuthContext } from "../../AuthContext";
import "./Geofence.css";
import Autocomplete from "@mui/material/Autocomplete";
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
const [salesVesselsOrginal, setSalesVesselsOrginal] = useState([]);
const [vessels, setVessels] = useState([]);
const [fleetVessels, setFleetVessels] = useState([]);
const [selectedVessel, setSelectedVessel] = useState(null);
const [vesselEntries, setVesselEntries] = useState({});
const [notifications, setNotifications] = useState([]);
const { role, id } = useContext(AuthContext);
const OrgId = id.includes("_") ? id.split("_")[1] : id.split("_")[0];
const [loading, setLoading]=useState(true);
const [testloading, setTestLoading]=useState(false); 
const [tabAnimation, setTabAnimation] = useState({ opacity: 1 });
const [organizations, setOrganizations] = useState([]); // State to hold organization data
const [selectedOrg, setSelectedOrg ] = useState(''); // Selected organization
const [activeTab, setActiveTab] = useState(1);
const [error, setError] = useState('');
const [ports, setPorts] = useState([]); // Store ports data
const [portnames, setPortnames] = useState([]); // Store ports data
const [selectedPort, setSelectedPort] = useState([]);
const [originalRows, setOriginalRows] = useState([]);
const [originalVessels, setOriginalVessels] = useState([]);
const [allRows, setAllRows] = useState([]);
const [allVessels, setAllVessels] = useState([]);
const [dataSource, setDataSource] = useState([]);
const [salesData, setSalesData] = useState([]);
const [originalFilteredSales, setOriginalFilteredSales] = useState([]);
const [filteredSales, setFilteredSales] = useState([]);

    // State to control if the Select component is enabled or disabled
    const [isDisabled, setIsDisabled] = useState(false);

    // Toggle the disabled state
    const toggleDisable = () => {
      setIsDisabled(!isDisabled);
    };


  useEffect(() => {
    setSelectedVessel(null);
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/ism-organizations/get-ISM-organizations`) // Adjust the URL to your API endpoint
      .then((response) => {
        console.log(response.data);
        setOrganizations(response.data); // Set the fetched organization data
        console.log(organizations);
      
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, [activeTab]);
  
  const handleRowClick = (vessel) => {
    const selected = fleetVessels.find(v => v.IMO === vessel.IMO ) || vessels.find(v => v.IMO === vessel.IMO );
    if (selected) {
      setSelectedVessel(selected);
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.AIS.LATITUDE, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.AIS.LONGITUDE, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel ? [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE] : calculateMapCenter();
  const zoom = selectedVessel ? 10 : 6;

const fetchSalesVessels = async (userId) => {
  try {
    // Extract orgId from userId
    let OrgId = userId.includes('_') ? userId.split('_')[1] : userId.split('_')[0];
    
    // Define the base URL for the API
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch only the relevant vessels from the server based on orgId
    const response = await axios.get(`${baseURL}/api/get-salesvessels-based-on-OrgId`, {
      params: {
        OrgId: OrgId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching IMO values:", error);
    return [];
  }
};
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
    return response.data;
  } catch (error) {
    console.error("Error fetching vessels values:", error);
    return [];
  }
};
const sortPriority = (a, b) => {
  const order = { IncreaseProfit: 1, Grow: 2, Defend: 3,Maintain: 4,Cut: 5, 'N/A': 6 };
  return (order[a.Priority] || 6) - (order[b.Priority] || 6); // Default to a value greater than 4 for unknown types
};

const formatEntries = (salesData , vessels ) => {
  return salesData
    .map(sale => {
      // Find the matching tracked vessel by IMO number
      const matchingVessel = vessels.find(vessel => vessel.AIS.IMO === sale.IMO);

      // If a matching vessel is found, merge the relevant data
      if (matchingVessel) {
        return {
          SalesQuotationNumber: sale.SalesQuotationNumber || '-',
          CaseId: sale.CaseId || '-',
          SalesResponsible: sale.SalesResponsible || '-',
          CustomerOwner: sale.CustomerOwner || '-',
          AISName: matchingVessel?.AIS.NAME || '-',
          IMO: matchingVessel?.AIS.IMO || '-',
          SPEED: matchingVessel?.AIS.SPEED || '-',
          ETA: matchingVessel?.AIS.ETA || '-',
          Destination: matchingVessel?.AIS.DESTINATION || '-',
          RegionName: matchingVessel?.AisPullGfType || '-',
          GeofenceStatus: matchingVessel?.GeofenceStatus || '-',
          Priority: sale.Priority || '-',
          DateOfLastSentQuote: sale.DateOfLastSentQuote || '-',
          Amount: sale.Amount || '-',
          createdAt: sale.createdAt 
            ? new Date(sale.createdAt).toISOString().split('T')[0] 
            : '-', // Extract only the date portion
        };
      }
      // Return a placeholder if no matching vessel is found
      return {
        SalesQuotationNumber: sale.SalesQuotationNumber || '_',
        CaseId: sale.CaseId || '-',
        SalesResponsible: sale.SalesResponsible || '-',
        CustomerOwner: sale.CustomerOwner || '-',
        AISName: '-',
        IMO: sale.IMO || '-',
        ETA: '-',
        SPEED: '-',
        Destination: '-',
        RegionName: '-',
        GeofenceStatus: '-',
        Priority: sale.Priority || '-',
        DateOfLastSentQuote: sale.DateOfLastSentQuote || '-',
        Amount: sale.Amount || '-',
        createdAt: sale.createdAt 
        ? new Date(sale.createdAt).toISOString().split('T')[0] 
        : '-', // Extract only the date portion
      };
    })
    .sort(sortPriority); // Apply sorting based on GeofenceType
};
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  // Once tracked vessels and sales data are fetched, format and set the table data
  if (salesData.length > 0 && vessels.length > 0) {
    const extractOrgPart = (value) => {
      let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
      return orgId;
    };

    const filteredSalesData = salesData.filter((entry) => entry.OrgId === extractOrgPart(id));
    const formattedData = formatEntries(filteredSalesData, vessels);
    setOriginalFilteredSales(formattedData); 
    setFilteredSales(formattedData); 

  }
}, [salesData]);

useEffect(() => {
  console.log(filteredSales);
}, [filteredSales]);
  const fetchISMData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/ism-organizations/get-ISM-data`, {
        params: { role, id }
      });
      // Categorize the formatted data based on AisPullGfType
      const { formattedData, vesselData} = response.data;
      console.log( response.data);
      setFleetVessels(vesselData);
      // Transform the `AisPullGfType` values before setting the rows
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
      setOriginalRows(transformedData);
      setOriginalVessels(vesselData);
      setAllRows(transformedData);
      setAllVessels(vesselData);
    } catch (error) {
      console.error('Error fetching ISM data:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const salesDataResponse = await axios.get(`${baseURL}/api/get-upload-sales-data`);
      setSalesData(salesDataResponse.data);
      console.log(salesDataResponse.data);
      console.log(salesDataResponse);
    } catch (error) {
      console.error('Error fetching sales data:', error);
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
const fetchVessels = async (role, userId) => {
  try {
      if (role === 'hyla admin') {
      } else if (role === 'organization admin' || role === 'organizational user') {
        const vesselsFiltered = await fetchSalesVessels(userId); // Await this async function
        setVessels(vesselsFiltered);
        setSalesVesselsOrginal(vesselsFiltered);
      } else if (role === 'guest') {
            // Now, you need to fetch the IMO values for the user
            const vesselsFiltered = await fetchVesselById(userId); // Await this async function
            setVessels(vesselsFiltered);
            setSalesVesselsOrginal(vesselsFiltered);
      }else{
        console.error('Not Found')
      }

  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};


useEffect(() => {
  const fetchData = async () => {
    await fetchVessels(role, id);
    await fetchSalesData(); // ✅ Ensure sales data is fetched after vessels
    await fetchISMData();
    await fetchPorts();
  };

  fetchData();
}, [role, id]);

const handleOrgChange = (event, value) => { 

  if(!value && selectedPort && selectedPort.UNLOCODE){
    if ( selectedPort && selectedPort.UNLOCODE) {
   // Further filter rows where AIS.DESTINATION matches selectedPort.UNLOCODE
  let filteredAllRows = originalRows.filter(row => row.AIS.DESTINATION === selectedPort.UNLOCODE);
    
   // Further filter vessels where AIS.DESTINATION matches selectedPort.UNLOCODE
  let filteredAllVessels = originalVessels.filter(vessel => vessel.AIS.DESTINATION === selectedPort.UNLOCODE);
      setAllVessels(filteredAllVessels);
      setAllRows(filteredAllRows);
      setSelectedOrg(null);
      return;

  }
  } else  if(!value){
    setSelectedOrg(null);
    setAllRows(originalRows);
    setAllVessels(originalVessels);

    return
  }
  setSelectedOrg(value.companyTitle); // Update selected organization

  let filteredAllRows = originalRows.filter(row => row.CompanyTitle === value.companyTitle);
  let filteredAllVessels = originalVessels.filter(vessel => 
    filteredAllRows.some(row => row.IMO === vessel.IMO)
  );
  // Step 3: Further filter by selectedPort if it contains data
  if (selectedPort && selectedPort.UNLOCODE)  {
   console.log(selectedPort);

    const selectedPortUNLOCODE = selectedPort.UNLOCODE; // Since selectedPort contains only one element

    // Further filter rows where AIS.DESTINATION matches selectedPort.UNLOCODE
    filteredAllRows = filteredAllRows.filter(row => row.AIS.DESTINATION === selectedPortUNLOCODE);
    
    // Further filter vessels where AIS.DESTINATION matches selectedPort.UNLOCODE
    filteredAllVessels = filteredAllVessels.filter(vessel => vessel.AIS.DESTINATION === selectedPortUNLOCODE);

    console.log("Filtered Rows by Port:", filteredAllRows);
    console.log("Filtered Vessels by Port:", filteredAllVessels);
  }

  // Step 4: Update state
  setAllRows(filteredAllRows);
  setAllVessels(filteredAllVessels);
};

  // Modify handleNewGeofenceEntry to include the vessel's name and geofence details
  const handleNewGeofenceEntry = (message, vessel) => {
    setNotifications((prev) => [
      ...prev,
      {
        title: `${vessel.AIS.NAME} has entered ${message.title}`,
        date: new Date().toLocaleTimeString(),
        image: <img src={team2} alt="vessel" />,
      }
    ]);
  };

  // Disable keyboard shortcuts and mouse zoom
  useEffect(() => {
    const handleKeyDown = (event) => {
     
      if (event.key.startsWith('F') || (event.ctrlKey && (event.key === '+' || event.key === '-'))) {
        event.preventDefault();
        toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
      }
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const handlePortSelect = (event, value) => {
    if(!value && selectedOrg){
      if (selectedOrg) {
     let  filteredAllRows = originalRows.filter(row => row.CompanyTitle === selectedOrg);

     let  filteredAllVessels = originalVessels.filter(vessel =>
            filteredAllRows.some(row => row.IMO === vessel.IMO)
        );
        setAllVessels(filteredAllVessels);
        setAllRows(filteredAllRows);
        setFilteredSales(originalFilteredSales);
        setVessels(salesVesselsOrginal);

        return;

    }
    }
    else if (!value) {
      // If no port is selected, reset to original data
    setSelectedPort( null);
      setFilteredSales(originalFilteredSales);
      setVessels(salesVesselsOrginal);
      setAllVessels(originalVessels);
      setAllRows(originalRows);
      return;
    }
    setSelectedPort(value || null);
    // Filter vessels based on AIS.DESTINATION
    let filteredVessels = salesVesselsOrginal.filter(
      (vessel) => vessel.AIS?.DESTINATION === value.UNLOCODE
    );

  
    // Filter allVessels based on AIS.DESTINATION
    let filteredAllVessels = originalVessels.filter(
      (vessel) => vessel.AIS?.DESTINATION === value.UNLOCODE
    );

  
    // Filter allRows based on AIS.DESTINATION
    let filteredAllRows = originalRows.filter(
      (row) => row.AIS?.DESTINATION === value.UNLOCODE
    );
  
  
    console.log(filteredAllVessels);
    console.log(filteredAllRows);

       // Step 4: If selectedOrg exists, further filter by organization
       if (selectedOrg) {
        filteredAllRows = filteredAllRows.filter(row => row.CompanyTitle === selectedOrg);

        filteredAllVessels = filteredAllVessels.filter(vessel =>
            filteredAllRows.some(row => row.IMO === vessel.IMO)
        );
    }

    setVessels(filteredVessels);
    setAllVessels(filteredAllVessels);
    setAllRows(filteredAllRows);

    const finalSalesData = originalFilteredSales.filter(entry =>entry.Destination === value.UNLOCODE);
    console.log(finalSalesData);
   
    setFilteredSales(finalSalesData);
  };
  
  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />

      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1} mb={2} >
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
                            console.log("Option in getOptionLabel:", option);
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


      {(activeTab === 1 &&
      //  isDisabled &&
        <>
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
              options={organizations || []}
              getOptionLabel={(option) => {
                console.log("Option in getOptionLabel:", option);
                return typeof option === "object" && option?.companyTitle ? option.companyTitle : "";
              }}
              onChange={handleOrgChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Organization" variant="outlined" />
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
</>
      )}

</Box>
      <div style={{
      maxWidth: '100%',
      paddingTop: '0px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          className="tabs" 
          indicatorColor="primary"
          textColor="primary"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Tab label="Current Orders" />
          <Tab label="Up Sell With Fleet Managers" />
        </Tabs>
        </div>
      <ArgonBox py={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              {/* <CardContent> */}

               {(activeTab === 0 && 
                <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  ports={ports}
                  selectedPort={selectedPort}
                />
               )} 

              {(activeTab === 1 &&
              <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={allVessels}
                  selectedVessel={selectedVessel}
                  ports={ports}
                  selectedPort={selectedPort}
                />

              )} 

            </Card>
          </Grid>
        </Grid>
        <br></br>
        <Box mt={0}>
          <div className="tab-content"> 
            {activeTab === 0 && (
              <SalesRadar
                // vesselEntries={vesselEntries}
                filteredSales={filteredSales}
                vessels={vessels}
                onRowClick={handleRowClick}
                selectedPort={selectedPort}
                OrgId={OrgId}
              />
            )}
        {activeTab === 1 && (
              <>
                {/* {selectedTab === 0 && */}
                
                 <ISMTable rows={allRows} onRowClick={handleRowClick} />
              </>
            )}
          </div>
        </Box>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;
