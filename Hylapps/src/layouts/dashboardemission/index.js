/* eslint-disable no-unused-vars */
// @mui material components
import Grid from "@mui/material/Grid";
import React, { useState,useEffect } from "react";
// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import axios from "axios";
// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard1 from "examples/Cards/StatisticsCards/DetailedStatisticsCard1";
// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";

import VoyageTabel from "./VoyageTabel";
// import ReactSearchBox from "react-search-box";
function Dashboardemission() {
  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };
  const { size } = typography;
  const [selectedOptions, setSelectedOptions] = useState();
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);

  // Function triggered on selection
  function handleSelect(data) {
    setSelectedOptions(data);
  }

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

      

    // Fetch vessel data from the backend API
    axios.get(`${baseURL}/api/get-tracked-vessels-emission`)
      .then((response) => {
        // Log the response data to the console
        // console.log(response.data);
        setVessels(response.data); // Set the fetched data to state
        // console.log(vessels);
      })
      .catch((err) => {
        console.error('Error fetching vessel data:', err);
        setError(err.message); // Set error message
      });
  }, [vessels]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={0}>

     <Grid container spacing={3} mt={3}>
          <Grid item xs={12} md={6} lg={12}>
            <DetailedStatisticsCard1
              title="today's money"
              count="$53,000"
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
              percentage={{ color: "success", count: "+55%", text: "since yesterday" }}
            />
          </Grid>
          </Grid>
      <Grid container  mt={10} >
        <Grid item xs={12} md={0} lg={12}  mt={3}>
         <VoyageTabel /> 
         </Grid>
       </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboardemission;
