import { useEffect, useState, useMemo, useContext  } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, MenuItem, ListItemIcon, Modal, TextField, Button, Typography, Select, Checkbox, ListItemText } from '@mui/material';
import { AccountCircle, Send } from '@mui/icons-material';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { AuthContext } from "../../AuthContext";

// Sorting function to order GeofenceType as Berth > Terminal > Anchorage > N/A
const sortGeofenceType = (a, b) => {
  const order = { Berth: 1, Terminal: 2, Anchorage: 3, 'N/A': 4 };
  return (order[a.GeofenceType] || 5) - (order[b.GeofenceType] || 5); // Default to a value greater than 4 for unknown types
};


// // to delete start
// const formatEntries1 = (trackedVessels = []) => {
//   return trackedVessels
//   .filter((vessel) => vessel.AisPullGfType === 'inport') // Only show vessels in port
//     .map(vessel => ({
//       AISName: vessel.AIS?.NAME || 'Unknown Vessel',
//       GeofenceStatus: vessel.GeofenceStatus || '-',
//       ETA: vessel.AIS?.ETA || 'N/A',
//       Destination: vessel.AIS?.DESTINATION || 'N/A',
//       GeofenceType: vessel.GeofenceType || '-',
//       CaseId: vessel.CaseId || '-'
//     }))
//     .sort(sortGeofenceType); // Apply sorting here to ensure Berth is at the top
// };
// // to delete end






const ShipsInport = ({dataSource, vessels = [], onRowClick }) => {
  const { role,id} = useContext(AuthContext); 
  // const [dataSource, setDataSource] = useState([]);

  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [openModal, setOpenModal] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [email, setEmail] = useState('');
  const [selectedNames, setSelectedNames] = useState([]); // For multi-select
  const [usersList, setUsersList] = useState([]);


    useEffect(()=>{
      console.log(dataSource);
    },[dataSource])





 

  const handleRowClick = (rowData) => {
    const selectedVesselName = rowData.AISName ? rowData.AISName.trim() : '';
    if (!selectedVesselName) {
      console.warn('AISName is undefined or empty in rowData:', rowData);
      return;
    }

    const selectedVesselData = vessels.find(vessel => vessel.name.trim() === selectedVesselName);
    if (selectedVesselData) {
      onRowClick(selectedVesselData);
    } else {
      console.warn(`Vessel data not found for: ${selectedVesselName}`);
    }
  };



  
  const columns = useMemo(() => [

 
    {
      header: 'Case Id',
      accessorKey: 'CaseId',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
   
    {
      header: 'IMO',
      accessorKey: 'IMO',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Vessel Name',
      accessorKey: 'AISName',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Agent Name',
      accessorKey: 'AgentName',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Info1',
      accessorKey: 'Info1',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    
    {
      header: 'Ops ETA',
      accessorKey: 'OpsETA',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },


    {
      header: 'AIS ETA',
      accessorKey: 'ETA',
      // size: 150,
      cell: (info) => {
        const rawEta = info.getValue();
        // Convert the raw string to the desired format with local timezone
        const formattedEta = rawEta
          ? new Date(rawEta).toLocaleString('en-US', {
              day: '2-digit',
              month: 'short', // Jan, Feb, etc.
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false, // 24-hour format
              timeZoneName: 'short', // Include time zone abbreviation (e.g., GMT, EST)
            }).replace(',', '') // Remove the comma between date and time
          : 'N/A'; // Handle cases where ETA is missing
        return <Box sx={{ textAlign: 'center' }}>{formattedEta}</Box>;
      },
    },
    {
      header: 'Destination',
      accessorKey: 'Destination',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Region Name',
      accessorKey: 'AisPullGfType',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Location',
      accessorKey: 'RegionName',
      // size: 150,
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
   
    
  ], []);


  
  const renderRowActionMenuItems = ({ closeMenu, row }) => [
    <MenuItem
      key={0}
      onClick={() => {
        closeMenu();
        handleRowClick(row.original);
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
      <i className='fa-solid fa-ship'></i>
      </ListItemIcon>
      View Vessel
    </MenuItem>,
    // <MenuItem
    //   key={1}
    //   onClick={() => {
    //     closeMenu();
    //     setSelectedVessel(row.original);
    //     setOpenModal(true); // Open the modal to send alert
    //   }}
    //   sx={{ m: 0 }}
    // >
    //   <ListItemIcon>
    //     <Send />
    //   </ListItemIcon>
    //   Send Alert
    // </MenuItem>,
  ];

  const handleCloseModal = () => {
    setOpenModal(false);
    setEmail('');
    setSelectedNames([]); // Reset the selection
  };

  const handleSendAlert = async () => {
    if (selectedNames.length === 0 || !email) {
      alert('Please select at least one user and enter an email.');
      return;
    }

    try {
      // Send the alert email (this is a placeholder for your backend API logic)
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-alert`, {
        names: selectedNames,
        email,
        vessel: selectedVessel?.AISName,
      });
      if (response.data.success) {
        alert('Alert sent successfully!');
      } else {
        alert('Failed to send alert.');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('An error occurred while sending the alert.');
    }
  };

  return (
    
    <div   style={{borderRadius: "25px"}}>
      {/* <h3 style={{ color: "#0F67B1", marginBottom: "5px" }}>
     Ships In Port <sup style={{color:'#FF8000'}}>{` (${filteredData.length})`}</sup>
                  </h3> */}
      {/* Search input field */}
      {/* <Box sx={{ marginBottom: '16px' }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ borderRadius: 2 }}
        />
      </Box> */}

      {dataSource.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <MaterialReactTable
          columns={columns} 
          data={dataSource} // Pass filtered data here
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnOrdering
          enableColumnDragging
          enableExport
          enableDensityToggle
  //         enableRowNumbers={false} 
  // enableRowSelection={false} 
  enableRowActions={true}
  renderRowActionMenuItems={renderRowActionMenuItems} // REMOVE THIS
          initialState={{ 
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ desc: false }],
            density: 'compact', 
            columnVisibility: {
              'mrt-row-actions': true, // Hide Actions column
              'mrt-expand': false, // Hide expandable rows column if present
            }
          }}

          muiTableProps={{
            sx: { 
              minWidth: '100%', 
              width: '100%', 
              tableLayout: 'auto',  // ✅ Allow dynamic column resizing
              borderCollapse: 'collapse', 
            },
          }}

          muiTablePaperProps={{ // Apply border radius to the whole table container
            sx: { 
              borderRadius: '15px', // Adjust as needed
              overflow: 'hidden', // Ensures child elements respect border-radius
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Optional shadow for better UI
           },
          }}

        
          muiTableContainerProps={{ 
            sx: { 
              overflowX: 'auto',  // ✅ Ensures table is scrollable on mobile
              maxWidth: "100%", 
            },
          }}
          
          muiTableColumnProps={{
            sx: { 
              maxWidth: '200px', 
              minWidth: '80px', 
              flexGrow: 1, // ✅ Allows columns to expand proportionally
            },
          }}
         
  muiTableHeadCellProps={{
    sx: { 
      fontWeight: 'bold', 
      padding: '10px', 
      textAlign: 'left', 
      color: '#0F67B1',  
      whiteSpace: 'nowrap',
    },
  }}
          muiTableBodyRowProps={{
            sx: { 
              textAlign: 'center', 
           
              marginLeft: "16px",
              marginRight: "16px",
              whiteSpace: 'nowrap',  // ✅ Prevents text wrapping
              overflow: 'hidden',   // ✅ Hides overflowing text
              textOverflow: 'ellipsis',  // ✅ Shows "..." for long text
            },
          }}
          
       
           

          muiTableBodyCellProps={(cell) => {
            const geofenceType = cell.row.original?.GeofenceType;
            let color = '';
            if (geofenceType === 'Berth') color = 'red';
            else if (geofenceType === 'Terminal') color = 'blue';
            else if (geofenceType === 'Anchorage') color = 'green';
            return { 
              sx: {
              color,
              textAlign: 'left !important', // ✅ Align all cell text to the left
         
              // whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px',
            }, };
          }}
        />
      )}
      
      {/* Modal for sending alert */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            padding: 4,
            borderRadius: 3,
            boxShadow: 24,
            width: 600,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" mb={2} sx={{ fontWeight: 'bold' }}>
            Send Alert
          </Typography>

          {/* Multi-Select for User Names */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }} style={{ textAlign: 'left' }}>
              User Names
            </Typography>
            <Select
              multiple
              fullWidth
              value={selectedNames}
              onChange={(e) => setSelectedNames(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
              sx={{
                borderRadius: 2,
              }}
            >
              {usersList.map((user) => (
                <MenuItem key={user.id} value={user.name}>
                  <Checkbox checked={selectedNames.includes(user.name)} />
                  <ListItemText primary={user.name} />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Dropdown for User Email */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }} style={{ textAlign: 'left' }}>
              User Email
            </Typography>
            <Select
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                borderRadius: 2,
              }}
            >
              {usersList.map((user) => (
                <MenuItem key={user.id} value={user.email}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button variant="outlined" onClick={handleCloseModal} sx={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendAlert}
              sx={{
                flex: 1,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

ShipsInport.propTypes = {
  dataSource: PropTypes.array.isRequired,
  vessels: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default ShipsInport;

