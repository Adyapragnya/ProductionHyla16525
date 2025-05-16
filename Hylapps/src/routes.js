/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';

import ArgonBox from "components/ArgonBox";
import { AuthContext } from "./AuthContext"; // Import AuthContext to get the role
import Dashboard from "layouts/dashboard";
import Dashboardcopy from "layouts/dashboardcopy";
import Geofence from "layouts/geofence";
import Alerts from "layouts/Alerts";
import Organization from "layouts/Organization";
import CreateUsers from "layouts/Users";
import AnalyticsHyla from "layouts/AnalyticsHyla"
import WristAnalytics from "layouts/AnalyticsWrist"
import Services from "layouts/services";
import ResetPassword from "layouts/authentication/ResetPassword";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Logout from "layouts/authentication/Logout";
import ISMOrganization from "layouts/ISMOrganization"
import ModulePermission from "layouts/ModulePermission";
import VesselMaster from "layouts/VesselMaster"

import Operations from "layouts/operations_dashboard"
import VesselTracker from "layouts/VesselsTracker"
import { Route } from "react-router-dom";
import SalesRadar from "layouts/SalesRadar"
import ShipRADAR from "layouts/ShipRADAR"
import ModifyGeofence from "layouts/ModifyGeofence";

import Dashboardemission from "layouts/newemission";
import Settings from "layouts/MasterConfig"

const allRoutes = [
 // --- Dashboard Routes ---
  {
    type: "route",
    name: "Dashboard",
    key: "landingPage",
    route: "/HYLA",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-house-laptop" />,
    element: <Dashboardcopy />, // Changed from component to element
  },
  {
    type: "route",
    name: "Ship Dashboard",
    key: "shipDashboard",
    route: "/dashboard/:vesselId",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa fa-ship" />,
    element: <Dashboard />, // Changed from component to element
  },
  {
    type: "route",
    name: "JIT Optimizer",
    key: "jitOptimizer",
    route: "/jit-optimizer",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-gauge" />,
    element: <Dashboardemission />,
  },

 // --- Analytics Routes ---
 {
  type: "route",
  name: "HYLA Analytics ",
  key: "hylaAnalytics",
  route: "/hyla-analytics",
  icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-magnifying-glass-chart" />,
  element: <AnalyticsHyla />, // Changed from component to element
},
{
  type: "route",
  name: "WRIST Analytics",
  key: "wristAnalytics",
  route: "/wrist-analytics",
  icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-magnifying-glass-chart" />,
  element: <WristAnalytics />, // Changed from component to element
},

  // --- Radar Routes ---
  {
    type: "route",
    name: "Sales Radar",
    key: "salesRadar",
    route: "/sales-radar",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
    element: <SalesRadar />,
  },
  {
    type: "route",
    name: "Ops Radar",
    key: "opsRadar",
    route: "/ops-radar",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-satellite" />,
    element: <ShipRADAR />,
  },

   // --- Geofence & Alerts ---
   {
    type: "route",
    name: "Geofence Management",
    key: "geofenceManagement",
    route: "/geofence-management",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-compass-drafting" />,
    element: <ModifyGeofence />, // Changed from component to element
  },
  {
    type: "route",
    name: "Alerts & Notifications",
    key: "alertsNotifications",
    route: "/alerts",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa-solid fa-envelope-open-text" />,
    element: <Alerts />, // Changed from component to element
  },

  // --- Management ---
  {
    type: "route",
    name: "Fleet Managers",
    key: "fleetManagers",
    route: "/fleet-managers",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-people-roof" />,
    element: <ISMOrganization />, // Changed from component to element
  },
  {
    type: "route",
    name: "Create Organization",
    key: "createOrganization",
    route: "/create-organization",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sitemap" />,
    element: <Organization />, // Changed from component to element
  },
  {
    type: "route",
    name: "Create Users",
    key: "createUsers",
    route: "/create-users",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa fa-users" />,
    element: <CreateUsers />, // Changed from component to element
  },

   // --- Settings ---
  {
    type: "route",
    name: "Settings",
    key: "settings",
    route: "/Settings",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-screwdriver-wrench" />,
    element: <Settings />, // Changed from component to element
    },

    // --- Auth ---
  {
    type: "route",
    name: "Reset Password",
    key: "resetPassword",
    route: "/authentication/reset-password",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="fa-solid fa-key" />,
    element: <ResetPassword />, // Changed from component to element
  },
  {
    type: "route",
    name: "Signup",
    key: "signUp",
    route: "/signup",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-right-from-bracket" />,
    element: <SignUp />, // Changed from component to element
  },
  {
    type: "route",
    name: "Logout",
    key: "signIn",
    route: "/",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-right-from-bracket" />,
    element: <Logout />, // Changed from component to element
  },
 
];

// Function to get company title from backend
const getCompanyTitle = async (orgId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
   
    const response = await fetch(`${baseURL}/api/organizations/get-companyTitle/${orgId}`);
    const data = await response.json();
    return data.organizationTitle; // Returning companyTitle from backend
  } catch (error) {
    console.error("Error fetching company title:", error);
    return null;
  }
};

// Routes component where routes are filtered based on role
const Routes = () => {
  const { role, id, permissions } = useContext(AuthContext); // Get the role and id from AuthContext
  const [companyTitle, setCompanyTitle] = useState("null"); // State to store companyTitle
  const navigate = useNavigate();
  const [salesOrgId,setSalesOrgId] = useState("");
  const [opsOrgId,setOpsOrgId] = useState("");
  const [mainDashboardOrgId,setMainDashboardOrgId] = useState("");
  const modulePermissions = permissions?.modulePermissions || {};
 
  useEffect(() => {
    console.log("Permissions from context:", permissions);
    console.log("Module Permissions:", permissions?.modulePermissions);
  }, [permissions]);
  
  useEffect(() => {
    const fetchOrgIds = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/get-routes-menu-enabling-ids`); // Await the fetch call
        const document = await response.json(); // Parse JSON data
  
        setSalesOrgId(document.salesOrgId);
        setOpsOrgId(document.opsOrgId);
        setMainDashboardOrgId(document.mainDashboardOrgId);
  
        // console.log("Sales Org ID:", document.salesOrgId);
      } catch (error) {
        console.error("Error fetching orgIds:", error);
      }
    };
  
    fetchOrgIds(); // Call the function inside useEffect
  }, [id]);
  

  useEffect(() => {
    const fetchCompanyTitle = async () => {

      const orgId = id ? (id.includes("_") ? id.split("_")[1] : id.split("_")[0]) : null;

      if (orgId) {
        const title = await getCompanyTitle(orgId);
        setCompanyTitle(title); // Set companyTitle once fetched
       
      }
    };

    fetchCompanyTitle(); // Fetch companyTitle on component mount
  }, [id]);

  

  // Get filtered routes based on role and companyTitle using useMemo for performance
  // const filteredRoutes = useMemo(() => getFilteredRoutes(role, id, companyTitle,salesOrgId), [role, id, companyTitle]);
  const updatedRoutes = useMemo(() => {
    return allRoutes.map(route => {
      if (route.key === "landingPage" && companyTitle) {
        return { ...route, name: `${companyTitle} Dashboard` };
      }
      return route;
    });
  }, [companyTitle]);
  

  const filteredRoutes = useMemo(() => {
 
  if (!permissions) return [];
     console.log(modulePermissions);
    console.log(updatedRoutes.filter(route => modulePermissions[route.key]));
    return updatedRoutes.filter(route => modulePermissions?.[route.key] === true);
  }, [updatedRoutes, permissions, modulePermissions]);

   
  
  return filteredRoutes;
  // Render the filtered routes
 
};

export default Routes;
