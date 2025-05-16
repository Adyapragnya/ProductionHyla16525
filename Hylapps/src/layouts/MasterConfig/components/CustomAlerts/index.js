import React, { useEffect, useState, useCallback } from "react";
import { aisFieldConfig, conditionOperators } from "./AisConstants";
import AlertModal from "./AlertModal";
import axios from 'axios';
import { useContext } from "react";
import { AuthContext } from "../../../../AuthContext";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Grid,
  useTheme,
  Box,
  Card,
  Fade,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Chip
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { IconButton, Popover, List, ListItem, ListItemText } from "@mui/material";
import PropTypes from 'prop-types';
import { Autocomplete } from '@mui/material';
import SearchableSelect from "./SearchableSelect";

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify'; // ✅ if you're using react-toastify
import 'react-toastify/dist/ReactToastify.css';





const CustomAlerts = () => {
    const { id,role, loginEmail } = useContext(AuthContext);
  
    const [alerts, setAlerts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [emails, setEmails] = useState([]);
    const [vesselIds, setVesselIds] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState({});
    const [selectedVessel, setSelectedVessel] = useState({});


    const [expandedAlert, setExpandedAlert] = useState(null); // Track expanded alert
    const [anchorElEmail, setAnchorElEmail] = useState({});
    const [anchorElVessel, setAnchorElVessel] = useState({});
    
   
    const [formErrors, setFormErrors] = useState({});
    const [alertType, setAlertType] = useState("ais"); // default to "ais"
   
    const [aisConditions, setAisConditions] = useState([
      { field: "", operator: "", value: "" }
    ]);
    const [logicalOperator, setLogicalOperator] = useState("OR");

   
   
  
    const [selectedGeofence, setSelectedGeofence] = useState("");
    const [selectedPort, setSelectedPort] = useState("");
    const [geofences, setGeofences] = useState([]);
    const [ports, setPorts] = useState([]);
    

    const updateCondition = (index, key, newValue) => {
      setAisConditions((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [key]: newValue,
        };
    
        // Auto-initialize value for "between" operator
        if (key === "operator" && newValue === "between") {
          updated[index].value = { start: "", end: "" };
        }
    
        return updated;
      });
    };
    
    
    const addCondition = () => {
      setAisConditions((prev) => [...prev, { field: "", operator: "", value: "" }]);
    };
    
    const removeCondition = (index) => {
      setAisConditions((prev) => prev.filter((_, i) => i !== index));
    };
    
    
  const getVesselDisplayName = (imo) => {
    const vesselObj = vesselIds.find(v => String(v.imo) === String(imo));
    return vesselObj ? `${vesselObj.imo} - ${vesselObj.name}` : imo;
  };
  

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${baseURL}/api/alerts/ais-parameter`);
        if (!res.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        alert(`Error fetching alerts: ${err.message}`);
      }
    };
    fetchAlerts();
  }, []);


  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    const fetchData = async () => {
      const geofRes = await axios.get(`${baseURL}/api/alerts/geofences/get-all-geofences-list`);
      setGeofences(geofRes.data);
  
      const portRes = await axios.get(`${baseURL}/api/alerts/geofences/get-all-ports-list`);
      setPorts(portRes.data);
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    // Fetching available emails for assignment
    const fetchEmails = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${baseURL}/api/alerts/users-emails-for-assigning`);
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setEmails(data); // Store the emails
      } catch (err) {
        alert(`Error fetching emails: ${err.message}`);
      }
    };

    // Fetching available vessels for assignment
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${baseURL}/api/alerts/vessels-imo-for-assigning`);
        if (!res.ok) {
          throw new Error("Failed to fetch vessels");
        }
        const data = await res.json();
        setVesselIds(data); // Store the vessel IDs (IMO)
      } catch (err) {
        alert(`Error fetching vessels: ${err.message}`);
      }
    };

    fetchEmails();
    fetchVessels();
  }, []);

  const isFormValid = () => {
    const aisValid = aisConditions.every((c) => {
      if (!c.field || !c.operator) return false;
  
      const config = aisFieldConfig[c.field];
      if (config?.type === "datetime" && c.operator === "between") {
        return c.value?.start && c.value?.end;
      }
  
      return c.value !== "" && c.value !== null && c.value !== undefined;
    });
  
    const geofenceValid =
      selectedGeofence &&
      (associatedPort || (selectedPort && alertType !== "geofence"));
  
    if (alertType === "ais") return aisValid;
    if (alertType === "geofence") return geofenceValid;
    if (alertType === "both") return aisValid && geofenceValid;
  
    return false;
  };
  
  
  const resetFormState = useCallback(() => {


    
    setAisConditions([{ field: "", operator: "", value: "" }]);
    setLogicalOperator("OR");
    setSelectedGeofence("");
    setSelectedPort("");
    setFormErrors({});
  }, []);
  
  
  const handleAddAlert = async () => {
    if (!isFormValid()) {
      // Update form errors to display them
      const errors = {};
  
      // AIS conditions validation
      aisConditions.forEach((cond, index) => {
        const config = aisFieldConfig[cond.field];
        const isBetween = cond.operator === "between";
      
        const missing =
          !cond.field ||
          !cond.operator ||
          (isBetween
            ? !cond.value?.start || !cond.value?.end
            : cond.value === "" || cond.value === null || cond.value === undefined);
      
        if (missing) {
          errors.aisConditions = errors.aisConditions || [];
          errors.aisConditions[index] = "Please complete all fields for the AIS condition.";
        }
      });
      
  
      // Geofence validation
      if (!selectedGeofence) {
        errors.geofence = "Please select a geofence.";
      }
      if (alertType !== "ais" && !associatedPort && !selectedPort) {
        errors.port = "Please select a port.";
      }
  
      setFormErrors(errors);
      return;
    }
  
    // Proceed with adding alert
    const formattedAisConditions = aisConditions.map((cond) => {
      const config = aisFieldConfig[cond.field];
      let formattedValue = cond.value;
      console.log('date.......',cond.value);
  
      if (config?.type === "datetime") {
        if (cond.operator === "between") {
          const start = cond.value?.start;
          const end = cond.value?.end;
        console.log('date.......',cond.value);
          if (start && end) {
            formattedValue = {
              start: new Date(start).toISOString(),
              end: new Date(end).toISOString(),
            };
          } else {
            formattedValue = null;
          }
        }
         else {
          formattedValue = new Date(cond.value);
        }
      } else if (config?.type === "number") {
        formattedValue = Number(cond.value);
      } else if (config?.type === "boolean") {
        formattedValue = cond.value === "true";
      }
  
      return {
        field: cond.field,
        operator: cond.operator,
        value: formattedValue,
      };
    });
  
    // Get geofence and port info
    const geofenceObj = geofences.find(g => g._id === selectedGeofence);
    const port = geofenceObj?.seaport
      ? ports.find(p =>
          p.name.toLowerCase() === geofenceObj.seaport.toLowerCase() ||
          p.UNLOCODE.toLowerCase() === geofenceObj.seaport.toLowerCase()
        )
      : ports.find(p => p.UNLOCODE === selectedPort);
  
    const payload = {
      alertType,
      createdBy: {
        loginUserId: id,
        email: loginEmail,
      },
      ...(alertType === "ais" || alertType === "both"
        ? {
            ais: {
              conditions: formattedAisConditions,
              logicalOperator,
            },
          }
        : {}),
      ...(alertType === "geofence" || alertType === "both"
        ? {
            geofence: {
              geofenceId: selectedGeofence,
              type: geofenceObj?.type || "",
              portUNLOCODE: port?.UNLOCODE || "",
            },
          }
        : {}),
    };
  
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      console.log(payload);
      const res = await fetch(`${baseURL}/api/alerts/ais-parameter/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
  

      const newAlert = await res.json();
      setAlerts((prev) => [...prev, newAlert]);
  
      // Reset form state
      resetFormState();
      toast.success("Alert created successfully!");

        setModalOpen(false);

      
       
    
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };
  
  

  const handleAssignDetails = async (alertId, email = null, vessel = null) => {
    if (!email && !vessel) return;
  
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      if (email) {
        const res = await fetch(`${baseURL}/api/alerts/ais-parameter/${alertId}/assign-recipient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
      }
  
      if (vessel) {
        const res = await fetch(`${baseURL}/api/alerts/ais-parameter/${alertId}/assign-vessel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vessel }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
      }
  
      // Fetch updated alert from backend
      const updatedRes = await fetch(`${baseURL}/api/alerts/ais-parameter`);
      const updatedData = await updatedRes.json();
      setAlerts(updatedData);
  
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };
  
  
  const handleUnassign = async (alertId, email = null, vessel = null) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
  
      if (email) {
        const res = await fetch(`${baseURL}/api/alerts/ais-parameter/${alertId}/unassign-recipient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
      }
  
      if (vessel) {
        const res = await fetch(`${baseURL}/api/alerts/ais-parameter/${alertId}/unassign-vessel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vessel }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
      }
  
      // Refresh the alerts list
      const updatedRes = await fetch(`${baseURL}/api/alerts/ais-parameter`);
      const updatedData = await updatedRes.json();
      setAlerts(updatedData);
  
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };
  

  
  const getApplicableOperators = (field) => {
    if (!field || !aisFieldConfig[field]) return [];

    const config = aisFieldConfig[field];
    if (config.type === "boolean") return [{ label: "Equals", value: "==" }];
    if (config.type === "datetime") {
      return [
        { label: "Equals", value: "==" },
        { label: "Before", value: "<" },
        { label: "After", value: ">" },
        { label: "Between", value: "between" },
      ];
    }
    return conditionOperators;
  };

  const formatDateTimeLocal = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return ""; // Invalid date
    return d.toISOString().slice(0, 16); // Remove seconds and 'Z'
  };

  
  const renderValueInput = (selectedField, selectedOperator, value, onChange) => {
    if (!onChange) {
      console.error("onChange is not defined!");
      return null;
    }
    
    if (!selectedField) return null;
    const config = aisFieldConfig[selectedField];
    if (!config) return null;

    if (config.type === "select") {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select</option>
          {config.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value} - {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (config.type === "boolean") {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select</option>
          <option value="true">True (ECA)</option>
          <option value="false">False (SECA)</option>
        </select>
      );
    }

    if (config.type === "datetime") {
      if (selectedOperator === "between") {
        
        return (
          <>
            <input
              type="datetime-local"
              value={value?.start}
              onChange={(e) => {
                onChange({ ...value, start: e.target.value });
              }}
              
            />
            <span style={{ margin: "0 5px" }}>to</span>
            <input
          type="datetime-local"
          value={value?.end}
          onChange={(e) => {
            onChange({ ...value, end: e.target.value });
          }}
        />
          </>
        );
      }
      return (
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.blur(); 
            }  }
        />
      );
    }

    const inputType = config.type === "number" ? "number" : "text";
    return (
      <input
        type={inputType}
        placeholder="Enter value"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  const handleAlertExpand = (alertId) => {
    // Toggle the expanded alert
    setExpandedAlert(prev => prev === alertId ? null : alertId);
  };



  const selectedGeofenceObj = geofences.find(g => g._id === selectedGeofence);

const associatedPort = selectedGeofenceObj?.seaport
  ? ports.find(
      (p) =>
        p.name.toLowerCase() === selectedGeofenceObj.seaport.toLowerCase() ||
        p.UNLOCODE.toLowerCase() === selectedGeofenceObj.seaport.toLowerCase()
    )
  : null;


  return (
    <Card
  elevation={3}
  sx={{
    borderRadius: 3,
    background: "#f5f5f5",
    border: "1px solid #e0e0e0",
    p: { xs: 2, md: 3 }

  }}
>

<Box sx={{ p: 2 }}>
  <Box sx={{
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  }}>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }} > Alerts On AIS Parameters </Typography>
  <Button
    variant="contained"
    onClick={() => setModalOpen(true)}
    sx={{
      color: " #F1F6F9",
      backgroundColor: " #115293",
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: " #1976d2",
      },
    }}
  >
    Create Alert&nbsp;<i className="fa-solid fa-bell"></i>
  </Button>
</Box>



<AlertModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddAlert}>
      <div className="modal-header">
        <h2>Create Alert</h2>
      </div>

      <div className="form-section">
      
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="alertType"
              value="ais"
              checked={alertType === "ais"}
              onChange={() => setAlertType("ais")}
            />
            AIS Parameter
          </label>
          <label>
            <input
              type="radio"
              name="alertType"
              value="geofence"
              checked={alertType === "geofence"}
              onChange={() => setAlertType("geofence")}
            />
            Geofence
          </label>
          <label>
            <input
              type="radio"
              name="alertType"
              value="both"
              checked={alertType === "both"}
              onChange={() => setAlertType("both")}
            />
            AIS + Geofence
          </label>
        </div>
      </div>

    {/* AIS Parameters Section */}
    {(alertType === "ais" || alertType === "both") && (
  <div className={`ais-parameters-section ${alertType === "both" ? "grouped-section" : ""}`}>
    {/* <h4 className="section-title">AIS Parameters</h4> */}

    {aisConditions.map((condition, index) => (
      
      <div key={index} className="parameter-card-with-logic">
        <div className="parameter-card">
          <label>Select AIS Field</label>
          <select
            value={condition.field}
            onChange={(e) => updateCondition(index, "field", e.target.value)}
          >
            <option value="">Select AIS Field</option>
            {Object.keys(aisFieldConfig).map((field) => (
              <option key={field} value={field}>
                {aisFieldConfig[field].label}
              </option>
            ))}
          </select>
         

          <label>Condition</label>
          <select
            value={condition.operator}
            onChange={(e) => updateCondition(index, "operator", e.target.value)}
            disabled={!condition.field}
          >
            <option value="">Select Condition</option>
            {getApplicableOperators(condition.field).map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          {renderValueInput(
            condition.field,
            condition.operator,
            condition.value,
            (val) => updateCondition(index, "value", val)
          )}

          {aisConditions.length > 1 && (
            <span
              className="remove-condition-btn"
              onClick={() => removeCondition(index)}
            >
              ✕
            </span>
          )}
        </div>

        {index < aisConditions.length - 1 && (
          <div className="operator-toggle">
            <button
              className={`toggle-btn ${logicalOperator === "OR" ? "active" : ""}`}
              onClick={() => setLogicalOperator("OR")}
            >
              OR
            </button>
            <button
              className={`toggle-btn ${logicalOperator === "AND" ? "active" : ""}`}
              onClick={() => setLogicalOperator("AND")}
            >
              AND
            </button>
          </div>
        )}
      </div>
    ))}

    <div className="add-condition-btn" onClick={addCondition}>
      + Add Another AIS Parameter
    </div>
  </div>
)}



      {/* Geofence Section */}
    {/* Geofence Section */}
{(alertType === "geofence" || alertType === "both") && (
  <div className="geofence-section">
    <div className="parameter-card">
      <label>Select Geofence</label>
      <SearchableSelect
        options={geofences}
        value={selectedGeofence}
        onChange={setSelectedGeofence}
        placeholder="Search geofences..."
        getOptionLabel={(g) => `${g.geofenceName} (${g.seaport}) - ${g.type}`}
      />
      {formErrors.geofence && <span className="error-msg">{formErrors.geofence}</span>}

      {associatedPort ? (
        <>
          <label>Associated Port</label>
          <div className="readonly-text">
            {associatedPort.name} ({associatedPort.UNLOCODE})
          </div>
        </>
      ) : (
        <>
          <label>Select Port</label>
          <SearchableSelect
            options={ports}
            value={selectedPort}
            onChange={setSelectedPort}
            placeholder="Search ports..."
            getOptionLabel={(p) => `${p.name} (${p.UNLOCODE})`}
          />
          {formErrors.port && <span className="error-msg">{formErrors.port}</span>}
        </>
      )}
    </div>
  </div>
)}


      <div className="button-row">
        <button className="button-primary" onClick={handleAddAlert} disabled={!isFormValid()}>
          Save Alert
        </button>

        <button className="button-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
      </div>
</AlertModal>




        {alerts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No alerts found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {alerts.map((alert) => (
             <Accordion
             key={alert._id}
             expanded={expandedAlert === alert._id}
             onChange={() => handleAlertExpand(alert._id)}
             sx={{
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              '&:before': { display: 'none' },
            }}
            
           >
           
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" color="text.primary">
                <strong>{aisFieldConfig[alert.field]?.label || alert.field}</strong> {alert.operator}{" "}
                {alert.operator === "between"
                  ? `${new Date(alert.value?.start).toLocaleString()} → ${new Date(alert.value?.end).toLocaleString()}`
                  : alert.value?.toString() || "N/A"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>     

   {/* Recipients Section */}
   <Box key={alert._id} className="p-2 border rounded mb-2">
   <Typography variant="subtitle2">👤 Recipients:</Typography>
<Box display="flex" flexWrap="wrap" gap={1} mb={1}>
  {alert.recipients.map((email) => (
    <Chip
      key={email}
      label={email}
      onDelete={() => handleUnassign(alert._id, email, null)}
      size="small"
      sx={{
        backgroundColor: " #e8f5e9",
        color: " #2e7d32",
        fontWeight: 500,
        borderRadius: "6px",

      }}
    />
  ))}
</Box>

<IconButton
  onClick={(e) =>
    setAnchorElEmail((prev) => ({ ...prev, [alert._id]: e.currentTarget }))
  }
  size="small"
  // color="primary"
  sx={{
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    "&:hover": {
      backgroundColor: "#c8e6c9",
    },
    borderRadius: "50%",
    transition: "background 0.2s ease",
  }}
>
  <AddIcon />
</IconButton>

<Popover
  open={Boolean(anchorElEmail[alert._id])}
  anchorEl={anchorElEmail[alert._id]}
  onClose={() =>
    setAnchorElEmail((prev) => ({ ...prev, [alert._id]: null }))
  }
  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
  PaperProps={{
    sx: {
      backgroundColor: "#fff",
      boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
      borderRadius: "6px",

      minWidth: 220,
      p: 1,
    },
  }}
>
  <List dense>
    {emails.map((email) => (
      <ListItem
        button
        key={email}
        onClick={() => {
          handleAssignDetails(alert._id, email, null);
          setAnchorElEmail((prev) => ({ ...prev, [alert._id]: null }));
        }}
      >
        <ListItemText primary={email} />
      </ListItem>
    ))}
  </List>
</Popover>

<Typography variant="subtitle2" mt={2}>🚢 Vessels:</Typography>
<Box display="flex" flexWrap="wrap" gap={1} mb={1}>
  {alert.vessels.map((imo) => (
   <Chip
   key={imo}
   label={getVesselDisplayName(imo)}
   onDelete={() => handleUnassign(alert._id, null, imo)}
   size="small"
   sx={{
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    fontWeight: 500,
    borderRadius: "6px",
  }}
 />
 
  ))}
</Box>

<IconButton
  onClick={(e) =>
    setAnchorElVessel((prev) => ({ ...prev, [alert._id]: e.currentTarget }))
  }
  size="small"
  color="primary"
  sx={{
    backgroundColor: "#e3f2fd",
    "&:hover": {
      backgroundColor: "#bbdefb",
    },
    borderRadius: "50%",
  transition: "background 0.2s ease",
  }}
>
  <AddIcon />
</IconButton>

<Popover
  open={Boolean(anchorElVessel[alert._id])}
  anchorEl={anchorElVessel[alert._id]}
  onClose={() =>
    setAnchorElVessel((prev) => ({ ...prev, [alert._id]: null }))
  }
  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
  PaperProps={{
    sx: {
      backgroundColor: "#fff",
      boxShadow: 3,
      borderRadius: 1,
      minWidth: 250,
      p: 1,
      maxHeight: 300,
      overflowY: "auto",
    },
  }}
>
  <List dense>
    {vesselIds.map((v) => (
      <ListItem
        button
        key={v.imo}
        onClick={() => {
          handleAssignDetails(alert._id, null, v.imo);
          setAnchorElVessel((prev) => ({ ...prev, [alert._id]: null }));
        }}
      >
        <ListItemText primary={getVesselDisplayName(v.imo)} />
      </ListItem>
    ))}
  </List>
</Popover>
  </Box>
    </AccordionDetails>
    </Accordion>
    ))}
  </Box>
    )}
  </Box>
    </Card>
  );
};

export default CustomAlerts;