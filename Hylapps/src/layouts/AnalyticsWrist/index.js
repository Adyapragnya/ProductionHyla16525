
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

// import DetailedStaticsCard from "./DetailedStatisticsCard";
import WristAnalytics from "./WristAnalytics";

// import ReactSearchBox from "react-search-box";
function AnalyticsWrist() {


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
    // Fetch vessel data from the backend API
    axios.get('http://localhost:5000/api/get-vessels')
      .then((response) => {
        // Log the response data to the console
        setVessels(response.data); // Set the fetched data to state
        
      })
      .catch((err) => {
        console.error('Error fetching vessel data:', err);
        setError(err.message); // Set error message
      });
  }, []);


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
        <Grid container  mt={3} >
            <Grid item xs={12} md={0} lg={12}  mt={3}>
            <WristAnalytics />
       </Grid>
            </Grid>
      </ArgonBox>
        {/*  */}
      <Footer />
    </DashboardLayout>
  );
}

export default AnalyticsWrist;
