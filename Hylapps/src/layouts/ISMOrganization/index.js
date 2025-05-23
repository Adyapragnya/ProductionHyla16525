
  
  /* eslint-disable no-unused-vars */
// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import React, { useState,useEffect } from "react";
// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import axios from "axios";
// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";
import Button from "@mui/material/Button";
// Dashboard layout components
import Slider from "layouts/dashboard/components/Slider";
// import Select from 'react-select';
import CreateOrganization from './CreateOrganization'; // If the file is named in lowercase
import ViewOrganization from './ViewOrganization';
import { useNavigate } from "react-router-dom";

// import { Search } from "@mui/icons-material";

import Loader from "./Loader";
// import DetailedStaticsCard from "./DetailedStatisticsCard";


// import ReactSearchBox from "react-search-box";
function ISMOrganization() {


  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };


  const { size } = typography;
  const navigate = useNavigate(); // Initialize navigate function
  const [showViewAlert, setShowViewAlert] = useState(false); // Track which component to show
  const [selectedOptions, setSelectedOptions] = useState();
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading]= useState(true);

  // Function triggered on selection
  function handleSelect(data) {
    setSelectedOptions(data);
  }

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

      

  
    // Fetch vessel data from the backend API
    axios.get(`${baseURL}/api/get-vessels`)
      .then((response) => {
        // Log the response data to the console
        console.log(response.data);
        setVessels(response.data); // Set the fetched data to state
        setLoading(false);

        
      })
      .catch((err) => {
        console.error('Error fetching vessel data:', err);
        setError(err.message); // Set error message
        setLoading(false);
      });
  }, []);


  return (
    <DashboardLayout>
    <DashboardNavbar />
    {loading ? (
      <Loader/>
    ):(
    <ArgonBox py={0}>
     <Grid container spacing={3} justifyContent="flex-end">
  <Grid item xs={12} sm={12} md={6} lg={3}>
    <Button
      variant="contained"
      color="warning"
      fullWidth
      onClick={() => setShowViewAlert(!showViewAlert)}
      sx={{
        color: (theme) => theme.palette.warning.main,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ArgonBox
        component="i"
        color="warning"
        fontSize="14px"
        className={showViewAlert ? "ni ni-single-copy-04" : "ni ni-fat-add"}
        sx={{ mr: 1 }}
      />
      {showViewAlert ? "View Saved Fleet organization" : "Create Fleet organization"}
    </Button>
  </Grid>
</Grid>

<Grid container spacing={3} mt={3}>
  <Grid item xs={12}>
    {showViewAlert ? <CreateOrganization /> : <ViewOrganization />}
  </Grid>
</Grid>

    </ArgonBox>
    )}
    <Footer />
  </DashboardLayout>
  );
}

export default ISMOrganization;


