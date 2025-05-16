import { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem, ListItemIcon} from '@mui/material';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { AuthContext } from "../../AuthContext";
import './texthigh.css';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sorting function to order GeofenceType as Berth > Terminal > Anchorage > N/A

const LOCAL_STORAGE_KEY = 'salesRadarTableState';

const SalesRadar = ({ filteredSales, vessels, onRowClick,selectedPort,OrgId }) => {

  const [openModal, setOpenModal] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [email, setEmail] = useState('');
  const [selectedNames, setSelectedNames] = useState([]); // For multi-select

  const { role, id } = useContext(AuthContext);

  useEffect(()=>{
    console.log(filteredSales);
  },[filteredSales])



  const handleRowClick = (rowData) => {
    const selectedVesselName = rowData.IMO ? rowData.IMO : '';
    if (!selectedVesselName) {
      console.warn('AISName is undefined or empty in rowData:', rowData);
      return;
    }

    const selectedVesselData = vessels.find(vessel => vessel.IMO === selectedVesselName);
    if (selectedVesselData) {
      onRowClick(selectedVesselData);
    } else {
      console.warn(`Vessel data not found for: ${selectedVesselName}`);
    }
  };


  const columns = useMemo(() => {

        const baseColumns = [
            {
              header: 'Vessel Name',
              accessorKey: 'AISName',
              size: 150,
          },
            {
              header: 'IMO',
              accessorKey: 'IMO',
              size: 150,
          },
            
            {
              header: 'Priority',
              accessorKey: 'Priority',
              size: 150,
          },

            {
              header: 'Date Of Last Sent Quote',
              accessorKey: 'DateOfLastSentQuote',
              size: 150,
          },

            {
              header: 'Amount',
              accessorKey: 'Amount',
              size: 150,
          },
            {
              header: 'Uploaded Date',
              accessorKey: 'createdAt',
              size: 150,
            },

            {
              header: 'ETA',
              accessorKey: 'ETA',
              size: 150,
          },
            {
              header: 'Destination',
              accessorKey: 'Destination',
              size: 150,
            },
            {
              header: 'Region Name',
              accessorKey: 'RegionName',
              size: 150,
            },
            {
              header: 'Location',
              accessorKey: 'GeofenceStatus',
              size: 150,
          },
        ];

        const specialColumns = [
          {
            header: 'Sales Qutation Number',
            accessorKey: 'SalesQuotationNumber',
            size: 150,
          },
          {
            header: 'Case Id',
            accessorKey: 'CaseId',
            size: 150,
        },
          {
            header: 'Sales Responsible',
            accessorKey: 'SalesResponsible',
            size: 150,
          },
          {
            header: 'Customer Owner',
            accessorKey: 'CustomerOwner',
            size: 150,
          },
        ];
          // If OrgId is NOT "ORG564", move specialColumns to the end
          return OrgId !== "ORG564" ? [...baseColumns, ...specialColumns] : [...specialColumns, ...baseColumns];

  }, [OrgId]);


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


  // 1. Initialize tableState from localStorage (keyed by user `id`)
const [tableState, setTableState] = useState(() => {
  const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${id}`);
  return saved
    ? JSON.parse(saved)
    : {
        density: 'compact',
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
        columnVisibility: {},
      };
});

// 2. Create a debounced saver
const debouncedSave = useCallback(
  debounce((state) => {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY}_${id}`,
      JSON.stringify(state),
    );
  }, 1000),
  [id],
);

// 3. A universal state‐change handler
const handleStateChange = (updater) => {
  setTableState((prev) => {
    const newState = typeof updater === 'function' ? updater(prev) : updater;
    debouncedSave(newState);
    return newState;
  });
};

  return (
    <div className="">
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
  <button
    onClick={() => {
      if (!filteredSales || filteredSales.length === 0) {
        toast.warning('No Data to Export');
        return;
      }

      const exportableRows = filteredSales.map((row) => {
        const { pointerColor, Action, ...cleanedRow } = row;
        return cleanedRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportableRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Orders Data');
      XLSX.writeFile(workbook, 'Current_Orders.xlsx');
    }}
    style={{
      backgroundColor: '#0F67B1',
      color: '#fff',
      padding: '4px 8px',
      fontSize: '12px',
      borderRadius: '3px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <i className="fa-solid fa-file-excel" style={{ fontSize: '14px' }}></i>
    <span style={{ marginLeft: '4px' }}>Export Excel</span>
  </button>
      </Box>
      {filteredSales.length === 0 ? (
        <p>No data to display</p>
      ) : (
        
      <MaterialReactTable
                columns={columns} 
                data={filteredSales} // Pass filtered data here
                enableColumnResizing
                enableGrouping
                enablePagination
                enableColumnPinning
                enableColumnOrdering
                enableColumnDragging
                enableExport
                enableDensityToggle
                enableRowActions={false}
                state={tableState}
                onStateChange={handleStateChange}
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
                            tableLayout: 'auto',  //Allow dynamic column resizing
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
                            overflowX: 'auto',  // Ensures table is scrollable on mobile
                            maxWidth: "100%", 
                          },
                        }}
                        
                        muiTableColumnProps={{
                          sx: { 
                            maxWidth: '200px', 
                            minWidth: '80px', 
                            flexGrow: 1, // Allows columns to expand proportionally
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
                            whiteSpace: 'nowrap',  // Prevents text wrapping
                            overflow: 'hidden',   // Hides overflowing text
                            textOverflow: 'ellipsis',  //  Shows "..." for long text
                          },
                        }}
                        muiTableBodyCellProps={(cell) => {
                          const Priority = cell.row.original?.Priority;
                          let color = '';
                          if (Priority === 'IncreaseProfit') color = 'green';
                          else if (Priority === 'Grow') color = 'blue';
                          else if (Priority === 'Defend') color = 'red';
                          else if (Priority === 'Maintain') color = 'brown';
                          else if (Priority === 'Cut') color = 'orange';
                          return {   style: { color,whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } };
                        }}
              />
      )}

    </div>
  );
};

SalesRadar.propTypes = {
  filteredSales: PropTypes.array.isRequired, 
  vessels: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  selectedPort:  PropTypes.array.isRequired,
  OrgId:  PropTypes.string.isRequired, 
};

export default SalesRadar;
