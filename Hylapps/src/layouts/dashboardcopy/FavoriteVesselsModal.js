import React,{useContext} from "react";
import { AuthContext } from "../../AuthContext";

import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Checkbox, List, ListItem, ListItemText, TextField,
  Button, ButtonBase, ToggleButton, ToggleButtonGroup, Typography, Paper, Grid, Tooltip, IconButton
} from "@mui/material";
import { useState, useEffect, useRef,useMemo  } from "react";
import FavoriteIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/StarBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import CloseIcon from "@mui/icons-material/Close";

import Swal from "sweetalert2";
import { Snackbar, Alert } from "@mui/material";
import Slide from "@mui/material/Slide";

const FavoriteVesselsModal = ({ open, onClose, vessels, favoriteVessels, updateFavoriteVessels}) => {
    const { role,id,loginEmail} = useContext(AuthContext); 
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

   
  const [tabIndex, setTabIndex] = useState("favorites");
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Store favorite vessel IMOs in a Set for quick lookup
  const favoriteIMOSet = new Set((favoriteVessels || []).map(v => v.imo));
  // const hasChanges = selectedFavorites.some((imo) => !favoriteIMOSet.has(imo));
  const hasNewSelections = selectedFavorites.some(imo => !favoriteIMOSet.has(imo));

  useEffect(() => {
    if (open) {
      setSelectedFavorites(Array.isArray(favoriteVessels) ? favoriteVessels.map(v => v.imo) : []);
      console.log("Loaded Favorites:", selectedFavorites);
    }
  }, [open, favoriteVessels]);
  

  
  
  const handleVesselSelection = (imo) => {
    imo = Number(imo);
  
    setSelectedFavorites((prevSelected) => {
      // Get only non-favorite vessels
      const nonFavoriteSelected = prevSelected.filter(id => !favoriteIMOSet.has(id));
      console.log(nonFavoriteSelected);
      // Toggle clicked vessel if it's NOT a favorite
      const updatedSelection = nonFavoriteSelected.includes(imo)
        ? nonFavoriteSelected.filter(id => id !== imo) // Remove if already selected
        : [...nonFavoriteSelected, imo]; // Add if not selected
  
      const finalSelection = [...favoriteVessels.map(v => v.imo), ...updatedSelection];
  
      console.log("Updated Selection:", finalSelection);
      return finalSelection;
    });
  };


  
  
  
const handleSave = async () => {
  const newlySelected = [...selectedFavorites].filter((imo) => !favoriteIMOSet.has(imo));
  // console.log(newlySelected);
  
  if (newlySelected.length === 0) {
 
    showSnackbar("You haven't selected any new vessels.", "error");
    
    return;
  }

  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const response = await fetch(`${baseURL}/api/set-vessels-favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, selectedImos: newlySelected, role, email: loginEmail }),
    });

    const data = await response.json();

    if (response.ok) {
      showSnackbar("Vessel(s) added to favorites.", "info");
  
        // 🔥 Call parent function to update favorites
        updateFavoriteVessels([...favoriteVessels, ...vessels.filter(v => newlySelected.includes(v.imo))]);
        setTabIndex("favorites");
  
    } else {
      showSnackbar(data.message || "Failed to add vessel to favorites.", "error");
    }
  } catch (error) {
    console.error("Error updating favorites:", error);
    showSnackbar("An error occurred.", "error");
  }

  // onClose();
};


const handleRemoveFavorite = async (imo) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const response = await fetch(`${baseURL}/api/remove-vessel-favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, imo }),
    });

    const data = await response.json();

    if (response.ok) {
      showSnackbar("Vessel removed from favorites.", "info");

    // 🔥 Call parent function to update favorites
    updateFavoriteVessels(favoriteVessels.filter(v => v.imo !== imo));

    } else {
      showSnackbar(data.message || "Failed to remove vessel.", "error");
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    showSnackbar("An error occurred.", "error");
  }
};

const showSnackbar = (message, severity = "info") => {
  setSnackbarMessage(message);
  setSnackbarOpen(true);
};

  

const filteredVessels = useMemo(() => {
  return (tabIndex === "favorites" ? favoriteVessels : vessels)
  .filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.imo.toString().includes(searchQuery) // Check IMO number as well
  );
}, [tabIndex, searchQuery, favoriteVessels, vessels]);

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
 <DialogTitle
  sx={{
    position: "relative",
    textAlign: "center",
    px: 2,
    py: 3,
    // borderBottom: "1px solid #eee",
  }}
>
  {/* Centered Typography */}
  <Typography
    variant="h6"
    fontWeight="600"
    sx={{
      width: "100%",
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none", // Prevents blocking icon click
    }}
  >
    Manage Favorite Vessels
  </Typography>

  {/* Right-aligned Close Button */}
  <IconButton
    onClick={onClose}
    size="small"
    aria-label="Close"
    sx={{
      position: "absolute",
      right: 8,
      top: "50%",
      transform: "translateY(-50%)",
      color: "text.secondary",
      "&:hover": { color: "error.main" },
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>




      {/* Toggle Tabs for Favorites & Tracked Vessels */}
      <Box display="flex" justifyContent="center" mt={1} mb={1.5}>
        <ToggleButtonGroup
          value={tabIndex}
          exclusive
          onChange={(e, newIndex) => setTabIndex(newIndex)}
          size="small"
          sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            p: 0.25,
          }}
        >
          <ToggleButton value="favorites">Favorites</ToggleButton>
          <ToggleButton value="tracked">Tracked Vessels</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <DialogContent sx={{ pt: 1, pb: 1 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search vessels..."
          variant="outlined"
          size="medium"
          margin="dense"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Favorite Vessels List */}
        {tabIndex === "favorites" && (
  <Box mt={2}>
    {filteredVessels.length > 0 ? (
      <Grid container spacing={2}>
        {filteredVessels.map((vessel) => (
          <Grid item xs={12} sm={6} key={vessel.imo}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  borderRadius: "12px",
                  boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f8f9fa",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                {/* Vessel Info */}
                <Box display="flex" alignItems="center" sx={{ flex: 1, overflow: "hidden" }}>
                  <DirectionsBoatIcon color="primary" sx={{ marginRight: 1, fontSize: 22 }} />
                  
                  {/* Tooltip for long names */}
                  <Tooltip title={vessel.name.length > 18 ? vessel.name : ""} arrow>
                    <Typography
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "140px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {vessel.name} 
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Remove from favorites button */}
              
            <ButtonBase
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "0.2s",
                width: 48, // Bigger clickable area
                height: 48,
                "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
              }}
              onClick={() => handleRemoveFavorite(vessel.imo)}
            >
              <DeleteIcon
                sx={{
                  color: "#d32f2f",
                  fontSize: 28, // Bigger delete icon
                  transition: "color 0.2s, transform 0.2s",
                  "&:hover": {
                    color: "#b71c1c",
                    transform: "scale(1.2)", // More noticeable effect
                  },
                }}
              />
            </ButtonBase>


              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography align="center" color="gray" mt={2} fontSize="14px">
        No favorite vessels available
      </Typography>
    )}
  </Box>
)}

        {/* Tracked Vessels Selection */}
        {tabIndex === "tracked" && (
          <>
  {filteredVessels.length > 0 ? (
  <List>
    {filteredVessels.map((vessel) => {
      const isFavorite = favoriteIMOSet.has(vessel.imo);
      const isChecked = Array.isArray(selectedFavorites) && selectedFavorites.includes(vessel.imo);

      return (
        <motion.div
          key={vessel.imo}
          {...(!isFavorite && { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } })}
        >
          <ListItem
            sx={{
              borderBottom: "1px solid #eee",
              backgroundColor: isFavorite ? "#f5f5f5" : "transparent",
              "&:hover": { backgroundColor: isFavorite ? "#f5f5f5" : "#f9f9f9" },
              opacity: isFavorite ? 0.6 : 1,
              cursor: "pointer",
            }}
            onClick={() => handleVesselSelection(vessel.imo)}
          >
            <Checkbox
              checked={isChecked}
              disabled={isFavorite} // Prevent selection of already favorite vessels
              // onChange={() => handleVesselSelection(vessel.imo)}
            />
              <ListItemText
                primary={
                  <Typography 
                    sx={{
                      fontSize: "14px", // Adjust text size
                      fontWeight: 500,
                      color: "#333",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingY: '3px',
                      marginLeft: '25px',
                      textAlign: 'left'
                    }}
                  >
                    {vessel.name} - {vessel.imo}
                  </Typography>
                }
              />
            {isFavorite && <FavoriteIcon color="error" />}
          </ListItem>
        </motion.div>
      );
    })}
  </List>
  ) : (
    <Typography align="center" color="gray" mt={2} fontSize="14px">
      No vessels available
    </Typography>
  )}

 
</>
)}

      </DialogContent>

      {tabIndex === "tracked" && (
  <DialogActions sx={{ justifyContent: "center", p: 1 }}>

<Tooltip title={!hasNewSelections ? "Select a vessel" : ""}>
  <span>
    <Button
      onClick={handleSave}
      variant="contained"
      color="primary"
      disabled={!hasNewSelections}
      sx={{
        px: 3,
        py: 1,
        borderRadius: "8px",
        boxShadow: 2,
        opacity: hasNewSelections ? 1 : 0.6,
        transition: "opacity 0.3s ease",
     
        color: "#fff", // <-- force white text color
      }}
    >
      Add to favorites
    </Button>
  </span>
</Tooltip>



  </DialogActions>
)}


   

  
<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert 
    severity="info" 
    sx={{ 
      display: "flex", 
      alignItems: "center", 
      width: "100%" // Ensures content is aligned properly 
    }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>

    </Dialog>
  );
};

FavoriteVesselsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vessels: PropTypes.arrayOf(PropTypes.shape({
    imo: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  favoriteVessels: PropTypes.arrayOf(PropTypes.shape({
    imo: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  updateFavoriteVessels: PropTypes.func.isRequired, 
};

export default FavoriteVesselsModal;
