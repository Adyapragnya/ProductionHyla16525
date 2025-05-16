import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// MUI components
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Permission view components
import CreatePermission from "./CreatePremission";
import ViewPermission from "./ViewPermission";

// Utility components
import Loader from "./Loader";

// Third-party libraries
import moment from "moment"; // if needed for date formatting

/**
 * ModulePermission component - A dashboard module for managing permissions.
 *
 * This component toggles between "Create Permissions" and "View Permissions"
 * views. It fetches vessel data from the backend on mount and handles errors
 * gracefully. All side effects and callbacks are memoized for optimal performance.
 */
function ModulePermission() {
  // Local state management
  const [showViewAlert, setShowViewAlert] = useState(false);
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * fetchVessels: Asynchronously fetch vessel data from the API.
   * This function uses async/await for clarity and proper error handling.
   */
  const fetchVessels = useCallback(async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    try {
      const { data } = await axios.get(`${baseURL}/api/get-vessels`);
      console.log("Fetched vessel data:", data);
      setVessels(data);
    } catch (err) {
      console.error("Error fetching vessel data:", err);
      setError(err.message || "Error fetching vessel data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vessel data once the component mounts
  useEffect(() => {
    fetchVessels();
  }, [fetchVessels]);

  // Toggle function for switching between permission views
  const togglePermissionView = useCallback(() => {
    setShowViewAlert((prev) => !prev);
  }, []);

  // If the data is still loading, show a Loader component
  if (loading) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={0}>
        <Grid container spacing={3} mt={0}>
          <Grid
            item
            xs={12}
            md={6}
            lg={12}
            mr={3}
            container
            justifyContent="flex-end"
          >
            {/* Button toggles between "Create Permissions" and "View Permissions" */}
            <Button
              variant="contained"
              color="warning"
              onClick={togglePermissionView}
              sx={{
                color: (theme) => theme.palette.warning.main,
                display: "flex",
                alignItems: "center",
              }}
            >
              <ArgonBox
                component="i"
                color="warning"
                fontSize="14px"
                className={
                  showViewAlert ? "ni ni-single-copy-04" : "ni ni-fat-add"
                }
                sx={{ mr: 1 }}
              />
              {showViewAlert ? "View Permissions" : "Create Permissions"}
            </Button>
          </Grid>
        </Grid>

        {/* Display any error messages */}
        {error && (
          <ArgonBox mt={2}>
            <ArgonTypography color="error">{error}</ArgonTypography>
          </ArgonBox>
        )}

        <Grid container mt={3}>
          <Grid item xs={12} md={0} lg={12} mt={3} mx={0}>
            {/* Conditionally render the permission components based on state */}
            {showViewAlert ? <CreatePermission /> : <ViewPermission />}
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ModulePermission;
