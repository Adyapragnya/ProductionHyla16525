// App.js
import React, {useState,useEffect,useMemo,useContext,lazy,Suspense,} from "react";
import PropTypes from "prop-types"; // Import PropTypes for validation
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "./routes";
import { useArgonController, setMiniSidenav, setOpenConfigurator } from "context";
import brand from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import "assets/css/nucleo-icons.css";
import "assets/css/nucleo-svg.css";
import { AuthContext } from "AuthContext";
import MyChatIcon from "./assets/images/frog.gif"; // Custom GIF for ChatBot icon
import { Fab } from "@mui/material";
import useIdleLogout from "./useIdleLogout";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { initGlobalSecurity } from "./globalSecurity";
// initGlobalSecurity();


// Lazy load authentication pages for faster initial load times
const SignIn = lazy(() => import("layouts/authentication/sign-in"));
const SignUp = lazy(() => import("layouts/authentication/sign-up"));
const ResetPassword = lazy(() =>
  import("layouts/authentication/ResetPassword")
);
// Lazy load ChatBot component so it’s only fetched when needed
const ChatBot = lazy(() => import("layouts/ChatBot/ChatBot"));

/* ----------------------------------------------------------------------------
  ErrorBoundary Component
  This class-based component catches runtime errors in its children.
  It prevents the entire app from crashing and logs errors for further analysis.
---------------------------------------------------------------------------- */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log errors to an external service if needed
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// Add PropTypes validation for ErrorBoundary
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ----------------------------------------------------------------------------
  PrivateRoute Component
  This functional component centralizes route protection logic.
  It checks if the user is authenticated before rendering the component.
---------------------------------------------------------------------------- */
const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? element : <Navigate to="/" />;
};

// Add PropTypes validation for PrivateRoute
PrivateRoute.propTypes = {
  element: PropTypes.node.isRequired,
};

export default function App() {
  const [controller, dispatch] = useArgonController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    darkSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const [isChatBotOpen, setChatBotOpen] = useState(false);

  // Use the idle logout hook to automatically sign out inactive users (set to 5 minutes)
  useIdleLogout(10000);
  // useIdleLogout(1800000);
  // This 1800000 ms is for Half Hour Session replace it with dev timer

  const filteredRoutes = routes();

  // Create an RTL cache to improve performance for right-to-left languages
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Handlers to manage the mini sidebar behavior
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  const toggleChatBot = () => setChatBotOpen(!isChatBotOpen);

  // Ensure the document direction is in sync with our app’s settings
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Scroll to top on route change for better UX
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname]);

  // Dynamically generate routes and wrap protected ones with PrivateRoute
  const getRoutes = (routesArray) => {
    return routesArray.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route && route.route) {
        // Public routes (SignIn, SignUp, ResetPassword)
        if (
          route.route === "/signup" ||
          route.route === "/authentication/reset-password" ||
          route.route === "/"
        ) {
          return (
            <Route
              path={route.route}
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  {route.element}
                </Suspense>
              }
              key={route.key}
            />
          );
        } else {
          // Protected routes
          return (
            <Route
              path={route.route}
              element={
                <PrivateRoute
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      {route.element}
                    </Suspense>
                  }
                />
              }
              key={route.key}
            />
          );
        }
      }
      return null;
    });
  };

  // Configurator button for theme and layout settings
  const configsButton = (
    <ArgonBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.5rem"
      height="3.5rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="default" color="inherit">
        settings
      </Icon>
    </ArgonBox>
  );

  // Grouping the layout components in one variable for clarity.
  const LayoutComponent = (
    <>
      {layout === "dashboard" && isAuthenticated && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={darkSidenav || darkMode ? brand : brandDark}
            brandName="Hyla"
            routes={filteredRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      {/* Suspense to delay rendering until routes are loaded */}
      <Suspense fallback={<div></div>}>
        <Routes>
          {getRoutes(filteredRoutes)}
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/authentication/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to={pathname} /> : <SignIn />
            }
          />
        </Routes>
      </Suspense>
      <Fab
        color="#222831"
        aria-label="chatbot"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          color: "#222831",
        }}
        onClick={toggleChatBot}
      >
        <img
          src={MyChatIcon}
          alt="ChatBot"
          style={{ width: "50px", height: "50px" }}
        />
      </Fab>
      <Suspense fallback={<div></div>}>
        <ChatBot open={isChatBotOpen} onClose={toggleChatBot} />
      </Suspense>
    </>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
<ToastContainer position="top-right" autoClose={3000} />

        <CssBaseline />
        <ErrorBoundary>{LayoutComponent}</ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
<ToastContainer position="top-right" autoClose={3000} />

      <CssBaseline />
      <ErrorBoundary>{LayoutComponent}</ErrorBoundary>
    </ThemeProvider>
  );
}
