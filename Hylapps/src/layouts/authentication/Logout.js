// Logout.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthContext"; // Adjusted import path

function Logout() {
  const { setIsAuthenticated, setRole, setId, setLoginEmail, setAdminId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setRole(null);
    setId(null);
    setLoginEmail("");
    setAdminId(null);

    navigate("/"); // Redirect to login
  }, []);

  return null; // No UI
}

export default Logout;
