import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; 
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import
import LoadingSpinner from './components/LoadingSpinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [role, setRole] = useState(null);
  const [id, setId] = useState(null);
  const [loginEmail, setLoginEmail] = useState(null);
  const [adminId, setAdminId ] = useState(null);
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async (userId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/permissions/user-permissions/${userId}`);
      const data = await res.json();
      if (data?.permissions) {
        setPermissions(data.permissions);
        console.log("Fetched Permissions:", data.permissions);
      } else {
        console.warn("No permissions found in response");
        setPermissions(null);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {

      try {
        const decodedToken = jwtDecode(token);
        const { role, id, email, AdminId } = decodedToken;

        setIsAuthenticated(true); 
        setRole(role); // Set role from token
        setId(id);
        setLoginEmail(email);
        setAdminId(AdminId);

        fetchPermissions(id);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token"); // Clear invalid token
        setIsAuthenticated(false); // Update state
        setRole(null); // Reset role
        setId(null);
        setLoginEmail(null);
        setAdminId(null);
        setPermissions(null);
        setLoading(false);
      }
    } else {
      setIsAuthenticated(false); // Set to false if no token
      setPermissions(null);
      setLoading(false);
    }
  }, [id]);
  
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, role, setRole ,id, setId, loginEmail, setLoginEmail, adminId, setAdminId, permissions, setPermissions, fetchPermissions }}>
         {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

