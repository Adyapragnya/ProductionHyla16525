import React, { useState, useCallback, Suspense, lazy, memo } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useMediaQuery } from "@mui/material";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonAvatar from "components/ArgonAvatar";

// Argon Dashboard 2 MUI example components
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

// Argon Dashboard 2 MUI base styles
import breakpoints from "assets/theme/base/breakpoints";

// Lazy load components for code splitting
const MasterSettings = lazy(() => import("layouts/MasterConfig/components/MasterSettings"));
const Notifications = lazy(() => import("layouts/MasterConfig/components/Notifications"));
const Apps = lazy(() => import("layouts/MasterConfig/components/Apps"));
const CustomAlerts = lazy(() => import("layouts/MasterConfig/components/CustomAlerts"));
const ManageUsers = lazy(() => import("layouts/MasterConfig/components/ManageUsers"));

// Image assets
const burceMars = "/Profile-Pic.png";
const bgImage = "/Background-Image-profile.png";

// Tab configuration for scalability
const TABS = [
  { label: "Alerts", icon: "fa-solid fa-bell", component: Notifications },
  { label: "Modules", icon: "fa-solid fa-folder-open", component: Apps },
  { label: "Vessel Master", icon: "fa-solid fa-ship", component: MasterSettings },
  { label: "AIS Alerts", icon: "fa-solid fa-compass", component: CustomAlerts },
  { label: "Users", icon: "fa-solid fa-users", component: ManageUsers },
];

const Header = memo(function Header({ tabValue, handleSetTabValue, tabsOrientation }) {
  return (
    <ArgonBox position="relative">
      <DashboardNavbar absolute light />
      <ArgonBox height="220px" />
      <Card
        sx={{
          py: 2,
          px: 2,
          boxShadow: ({ boxShadows: { md } }) => md,
        }}
      >
        <Grid container spacing={3} alignItems="center" direction={{ xs: "column", sm: "row" }}>
          <Grid item>
            <ArgonAvatar
              src={burceMars}
              alt="profile-image"
              variant="rounded"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item>
            <ArgonBox height="100%" mt={0.5} lineHeight={1}>
              <ArgonTypography variant="h5" fontWeight="medium">
                Hyla Admin
              </ArgonTypography>
              <ArgonTypography variant="button" color="text" fontWeight="medium">
                Founder
              </ArgonTypography>
            </ArgonBox>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            lg={6}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <Box sx={{ width: "100%" }}>
              <AppBar position="static">
                <Tabs
                  orientation={tabsOrientation}
                  value={tabValue}
                  onChange={handleSetTabValue}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ width: "100%" }}
                >
                  {TABS.map((tab, index) => (
                    <Tab
                      key={index}
                      label={tab.label}
                      icon={
                        <i
                          className={tab.icon}
                          style={{ marginTop: "6px", marginRight: "8px" }}
                        />
                      }
                    />
                  ))}
                </Tabs>
              </AppBar>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </ArgonBox>
  );
});

Header.propTypes = {
  tabValue: PropTypes.number.isRequired,
  handleSetTabValue: PropTypes.func.isRequired,
  tabsOrientation: PropTypes.string.isRequired,
};

function Overview() {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabsOrientation = isSmallScreen ? "vertical" : "horizontal";

  const [tabValue, setTabValue] = useState(0);

  const handleSetTabValue = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const CurrentComponent = TABS[tabValue].component;

  return (
    <DashboardLayout
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundPositionY: "70%",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header
        tabValue={tabValue}
        handleSetTabValue={handleSetTabValue}
        tabsOrientation={tabsOrientation}
      />
      <ArgonBox mt={5} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Suspense fallback={<div>Loading...</div>}>
              <CurrentComponent />
            </Suspense>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
