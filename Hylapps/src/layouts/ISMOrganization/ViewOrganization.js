import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
// import Modal from 'react-modal';
import Swal from 'sweetalert2';
import {CircularProgress, Button, Dialog,Checkbox, ListItemText, Table, TableHead, TableBody, TableRow, TableCell, Box, Typography, MenuItem, Select, FormControl, InputLabel, Modal } from "@mui/material";
import { Delete } from '@mui/icons-material'; 
import * as XLSX from 'xlsx';
import borders from 'assets/theme/base/borders';
const ViewOrganization = () => {
  const [organizations, setOrganizations] = useState([]); // State to hold organization data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isViewFleetsModalOpen, setIsViewFleetsModalOpen] = useState(false); 

  const [openFleetBulkModal, setOpenFleetBulkModal] = useState(false);
  const [openFleetBulkDisplayModal, setOpenFleetBulkDisplayModal] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [loadingBulkSales, setLoadingBulkSales] = useState(false);
  const [viewFleetOrganizations, setViewFleetOrganizations] = useState([]);

  // view and delete fleets
  const [fleetData, setFleetData] = useState([]); // Store fleet data
  const [searchedFleets, setSearchedFleets] = useState(''); 
  const [filteredFleets, setFilteredFleets] = useState([]); // Filtered fleet data based on organization
  const [selectedOrgs, setSelectedOrgs ] = useState([]); // Selected organization
  const [orgs, setOrgs] = useState([]); // Store unique organizations
  


  // fleet bulk
  const [fleetOrgId, setFleetOrgId] = useState(null); 
  const [fleetCompanyTitle, setFleetCompanyTitle] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    organization: '',
    OrgId: '',
    CompanyTitle: '',
    IMO: '',
    VesselName: '',
    GrossTonnage: '',
    ShipType: '',
    YearOfBuild: '',
    CurrentFlag: '',
    CurrentClass: '',
    DetentionForThis: '',
    DetentionForAll: '',
    ActingAsAndSince: '',
  }); // Form data state
  const [response, setResponse] = useState(null); // State to hold API response



  // start

  
  const handleAddSalesData = async () => {
    try {
      setOpenFleetBulkDisplayModal(false); // Close the modal
      setOpenFleetBulkModal(false);
      setLoadingBulkSales(true);

      const baseURL = process.env.REACT_APP_API_BASE_URL;

      // Prepare requestBody2
      const requestBody2 = uploadedData.map(row => ({
        
        OrgId: fleetOrgId,
        CompanyTitle: fleetCompanyTitle,
        AddedDate: new Date().toISOString(),
      }));

      // Combine uploadedData and requestBody2
      const combinedData = uploadedData.map((row, index) => ({
        ...row,
        ...requestBody2[index],
      }));

      

      // Send the combined data to the backend API
      await axios.post(`${baseURL}/api/ism-organizations/upload-ism-data`, combinedData);
      // location.reload();
      // console.log(combinedData);

      // Display success message
      Swal.fire({
        title: "Success!",
        text: "Fleets Data added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });


      setLoadingBulkSales(false);
      setFleetOrgId('');
      setFleetCompanyTitle('');
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to add fleets data.",
        icon: "error",
        confirmButtonText: "Retry",
      });
      console.error("Error sending data to the backend:", error);
      setLoadingBulkSales(false);
    }
  }

  const excelDateToJSDate = (serial) => {
    // Check if the serial is a valid number
    if (typeof serial !== "number" || isNaN(serial)) {
      console.error("Invalid Excel serial number:", serial);
      return null; // Return null if the serial number is invalid
    }
  
    // Excel's base date is January 1, 1900 (but incorrectly considers 1900 as a leap year)
    const excelBaseDate = new Date(1900, 0, 0); // January 1, 1900 (corrected leap year handling)
    const millisecondsInDay = 24 * 60 * 60 * 1000;
  
    // Subtract 1 because Excel's day 1 is January 1, 1900, and JavaScript's day 1 is 1 Jan 1970
    const jsDate = new Date(excelBaseDate.getTime() + (serial - 1) * millisecondsInDay);
  
    // Only take the date part, ignore the time (set time to 00:00:00)
    jsDate.setHours(0, 0, 0, 0);
  
    return jsDate;
  };
  // sales
  const generateSalesTemplate = () => {
    // Define the column headers as per the HTML structure you provided
    const templateData = [
      { IMO: '', VesselName: '', GrossTonnage: '', ShipType: '', YearOfBuild: '', CurrentFlag: '',CurrentClass: '', ManagementOffice:'' }, // Empty row for template
    ];
  
    // Generate the worksheet with the template data
    const ws = XLSX.utils.json_to_sheet(templateData, {
      header: ['IMO', 'VesselName', 'GrossTonnage', 'ShipType', 'YearOfBuild', 'CurrentFlag', 'CurrentClass', 'ManagementOffice'  ], // Define custom column headers
    });
  
    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
    // Generate and download the Excel file
    XLSX.writeFile(wb, 'bulk_fleets_template.xlsx');
  };
  
  
  const handleSalesExcelUpload = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Assume the first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
  
        // Process each row to handle date conversion
        const processedData = jsonData.map((row, index) => {
  
            // Iterate over each key in the row (i.e., each column)
            for (let key in row) {
              // If the value is missing, set it to 0
              if (row[key] === undefined || row[key] === null || row[key] === '') {
                row[key] = 0;
              }
            }
          return row;
        });
  
        // Set the processed data to the state
        setUploadedData(processedData);
        console.log(processedData);
        setOpenFleetBulkDisplayModal(true); // Open the modal to show data
      };
  
      reader.readAsBinaryString(file);
    }
  };

  // end

  // Fetch organization data when the component mounts
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/ism-organizations/get-ISM-organizations`) // Adjust the URL to your API endpoint
      .then((response) => {
        // console.log(response.data);
        setOrganizations(response.data); // Set the fetched organization data
        console.log(organizations);
      
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, [loading,isModalOpen,openFleetBulkModal]);

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/ism-organizations/get-view-ISM-organizations`) // Adjust the URL to your API endpoint
      .then((response) => {
        // console.log(response.data);
        setViewFleetOrganizations(response.data); // Set the fetched organization data
        // console.log(organizations);
      
        // setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching fleet organizations:', err);
        setError('Failed to load fleet organizations'); // Set error message if something goes wrong
        // setLoading(false); // Stop loading if there's an error
      });
  }, []);

  useEffect(() => {
    // This will log the updated organizations after the state is updated
    console.log(organizations);
  }, [organizations]); 


  // Handle input field changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Company Title selection
  const handleCompanyTitleChange = (e) => {
    const selectedOrg = organizations.find(org => org.companyTitle === e.target.value);
    setFormData({ ...formData, CompanyTitle: e.target.value, OrgId: selectedOrg ? selectedOrg.OrgId : '' });
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios
      .post(`${baseURL}/api/ism-organizations/upload-individual-ism-data`, formData) // Adjust the URL to your API endpoint
      .then((response) => {
        console.log("Response Data: ", response.data); // Log the response data to the console
        setResponse(response.data); // Set the response data to state
        Swal.fire('Success', 'Data added successfully!', 'success');
        setIsModalOpen(false); // Close the modal after successful submission
        setFormData({
          organization: '',
          OrgId: '',
          CompanyTitle: '',
          IMO: '',
          VesselName: '',
          GrossTonnage: '',
          ShipType: '',
          YearOfBuild: '',
          CurrentFlag: '',
          CurrentClass: '',
          ManagementOffice: '',
         
        }); // Reset form data
      })
      .catch((err) => {
        console.error('Error adding data:', err);
        Swal.fire('Error', 'Failed to add data. Please try again later.', 'error');
      });
  };

//  view fleets and delete starts

  // Fetch the fleet data when modal opens
  useEffect(() => {
    if (isViewFleetsModalOpen) {
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      axios
        .get(`${baseURL}/api/ism-organizations/get-whole-ISM-data`)
        .then((response) => {
          setFleetData(response.data);
          setFilteredFleets(response.data);

          // Extract unique organizations for filtering
          const uniqueOrgs = [...new Set(response.data.map((item) => item.CompanyTitle))];
          setOrgs(uniqueOrgs);
        })
        .catch((error) => {
          console.error('Error fetching fleet data:', error);
        });
    }
  }, [isViewFleetsModalOpen]);

  const handleCompanySelection  = (event) => {
    const selectedOrg = organizations.find(org => org.companyTitle === event.target.value);
    if (selectedOrg) {
      setFleetOrgId(selectedOrg.orgId);
      setFleetCompanyTitle(selectedOrg.companyTitle);
      setErrorMessage(''); 
    }
  };

    // Handle Upload button click
    const handleUploadClick = () => {
      if (!fleetCompanyTitle) {
        setErrorMessage('Please select a Fleet Organization before uploading data.');
      } else {
        // Proceed with file upload logic
        document.getElementById('excel-upload').click();
      }
    };
  

// Handle organization multi-select change
const handleOrgChange = (event) => {
  const { value } = event.target;
  setSelectedOrgs(value); // Update selected organizations

  // Filter data based on selected organizations
  if (value.length === 0) {
    setFilteredFleets(fleetData); // If no organization selected, show all data
  } else {
    // Filter fleet data based on selected organizations
    const filtered = fleetData.filter((item) => value.includes(item.CompanyTitle));
    setFilteredFleets(filtered);
  }
};

  // Handle delete request
  const handleDelete = (id) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios
      .delete(`${baseURL}/api/ism-organizations/delete-fleet/${id}`)
      .then(() => {
        setIsViewFleetsModalOpen(false);
        // Remove deleted item from filtered fleets
        setFilteredFleets(filteredFleets.filter((item) => item._id !== id));
        Swal.fire('Success', 'Fleet has been deleted successfully!', 'success');
      })
      .catch((error) => {
        setIsViewFleetsModalOpen(false);

        console.error('Error deleting fleet:', error);
        Swal.fire('Error', 'Failed to delete fleet. Please try again later.', 'error');

      });
  };

  // Function to handle modal close
const handleModalClose = () => {
  setOpenFleetBulkDisplayModal(false); // Close the modal
  setSelectedOrgs([]); // Clear the selected organizations
};

//  view fleets and delete ends

  // Define columns for the data grid
  const columns = [
    { name: 'companyTitle', header: 'Company Title', defaultFlex: 1 },
    { name: 'companyName', header: 'Company Name', defaultFlex: 1 },
    { name: 'address', header: 'Address', defaultFlex: 1 },
    { name: 'fleetCount', header: 'Fleets Count', defaultFlex: 1 },
    { name: 'updatedDate', header: 'Updated Date', defaultFlex: 1 },
  ];

// Table Styling //
  const tableCellStyle = {
    padding: '10px 5px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
    maxWidth: '220px',
    wordBreak: 'break-word',
    textAlign:"center"
    
  };


    const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedFleets = filteredFleets
    .filter((fleet) => {
      const imo = fleet.IMO ? fleet.IMO.toString().toLowerCase() : '';
      const vesselName = fleet.VesselName ? fleet.VesselName.toString().toLowerCase() : '';
      return (
        vesselName.includes(searchedFleets.toLowerCase()) ||
        imo.includes(searchedFleets.toLowerCase())
      );
    });

  const totalPages = Math.ceil(paginatedFleets.length / rowsPerPage);
  const displayedFleets = paginatedFleets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  
  
  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>View Fleet organization</h2>
      <label htmlFor="excel-upload" style={{ cursor: "pointer" }}>
        <button
         style={{
          marginBottom: '10px',
          marginLeft: '5px',
          backgroundColor: '#0F67B1',
          color: '#fff',
          padding: '8px 10px',
          fontSize:"12px",
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
          onClick={() => setOpenFleetBulkModal(true)}
        
        >
        <i className="fa-solid fa-file-upload"></i>&nbsp;Fleet Upload
        </button>
      </label>

      <button
        style={{
          marginBottom: '10px',
          marginLeft: '5px',
          backgroundColor: '#0F67B1',
          color: '#fff',
          padding: '8px 10px',
          fontSize:"12px",
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={() => setIsViewFleetsModalOpen(true)}
      >
        <i className="fas fa-eye"></i>&nbsp;View Fleets
      </button>
     
{/* bulk fleet start*/}
<Modal open={openFleetBulkModal} onClose={() => setOpenFleetBulkModal(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: "12px"
        }}
      >
        <h4 style={{color:' #0f67b1'}}> Download Template & Upload</h4>

           {/* Notes Section */}
           <Box sx={{ marginTop: 2, textAlign: 'left', fontSize: '14px', color: 'gray' }}>
  <ul style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
    <li>Click on <b>Download Fleets Template</b> to obtain the Excel file.</li>
    <li><b>Populate the template</b> with the required fleet data in the designated fields.</li>
    <li>Once completed, click on <b>Upload Fleets Data</b> to submit the file for processing.</li>
  </ul>
</Box>

        {/* Company Selection Dropdown */}
        <Box sx={{ marginTop: 2, width: '100%' }}>
        <label id="company-select-label">Select Fleet Organization</label>
          <FormControl fullWidth>
            <Select
              labelId="company-select-label"
              id="company-select"
              value={fleetCompanyTitle}
              onChange={handleCompanySelection}
              label="Select Company"
            >
              {organizations.map((org) => (
                <MenuItem key={org.orgId} value={org.companyTitle}>
                  {org.companyTitle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{marginTop:2 , display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateSalesTemplate}
          style={{
            backgroundColor: "#0F67B1",
            color: "white",
            borderRadius: "5px",
            padding: "10px 15px",
            width: '100%',
          }}
        >
          Download Fleets Template
        </Button>

  {/* Upload Fleets Data Button */}
  <Button
            variant="contained"
            color="primary"
            style={{
              backgroundColor: "#0F67B1",
              color: "white",
              borderRadius: "5px",
              padding: "10px 15px",
              width: '100%',
            }}
            onClick={handleUploadClick} // Trigger file upload or error message
            disabled={!fleetCompanyTitle} // Disable button if no company is selected
          >
            Upload Fleets Data
          </Button>
        </Box>
        {/* Hidden file input */}
        <input
          type="file"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          id="excel-upload"
          onChange={handleSalesExcelUpload}
        />
        {/* Hidden file input */}
      </Box>
    </Modal>
    <Modal
        open={openFleetBulkDisplayModal}
        onClose={handleModalClose}
       
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
         <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflow: "auto",
            borderRadius: "12px", // Rounded corners for the modal
          }}
  >
          <h2 id="modal-title">Uploaded Fleets Data</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>IMO</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Vessel Name</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Gross Tonnage</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Ship Type</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Year Of Build</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Current Flag</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Current Class</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>ManagementOffice</th>
              
              </tr>
            </thead>
            <tbody>
              {uploadedData.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.IMO}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.VesselName}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.GrossTonnage}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.ShipType}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.YearOfBuild}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.CurrentFlag}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.CurrentClass}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.ManagementOffice}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>

          <Box sx={{ textAlign: "right" }}>
     
          <Button
           variant="contained"
           color="primary"
          onClick={handleAddSalesData}
          style={{ marginTop: "20px", borderRadius: "8px", color: "white" }}
          >
            Add Fleets
          </Button>
        </Box>

        </Box>
      </Modal>



{/* bulk fleet ends*/}

      {/* Display loading message */}
      {loading && <p>Loading Fleet organization...</p>}

      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Displaying the organization data in a table */}
      {!loading && organizations.length > 0 ? (
        <ReactDataGrid
          idProperty="_id"
          columns={columns}
          dataSource={viewFleetOrganizations}
          style={{ minHeight: 500 }} // Adjust the height of the grid
          pagination
          defaultLimit={10} // Set default rows per page
        />
      ) : (
        !loading && <p>No Fleet organization found.</p>
      )}

      {/* Modal for adding individual data */}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >

<Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 4,
      maxHeight: "80vh",
      overflow: "auto",
      borderRadius: "12px", // Rounded corners for the modal
    }}
  >
        <h3 style={{ color: '#0F67B1', textAlign: 'center', marginBottom: '20px' }}>Add Individual Data</h3>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Organization</label>
              <select
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org.orgId} value={org.companyTitle}>
                    {org.companyTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
             
            </div>
            <div>
              <label>Company Title</label>
              <input
                type="text"
                name="CompanyTitle"
                value={formData.CompanyTitle}
                onChange={handleCompanyTitleChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>IMO</label>
              <input
                type="text"
                name="IMO"
                value={formData.IMO}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Vessel Name</label>
              <input
                type="text"
                name="VesselName"
                value={formData.VesselName}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Gross Tonnage</label>
              <input
                type="text"
                name="GrossTonnage"
                value={formData.GrossTonnage}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Ship Type</label>
              <input
                type="text"
                name="ShipType"
                value={formData.ShipType}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Year of Build</label>
              <input
                type="text"
                name="YearOfBuild"
                value={formData.YearOfBuild}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Current Flag</label>
              <input
                type="text"
                name="CurrentFlag"
                value={formData.CurrentFlag}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Current Class</label>
              <input
                type="text"
                name="CurrentClass"
                value={formData.CurrentClass}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Detention for This</label>
              <input
                type="text"
                name="DetentionForThis"
                value={formData.DetentionForThis}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Detention for All</label>
              <input
                type="text"
                name="DetentionForAll"
                value={formData.DetentionForAll}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div>
              <label>Acting As and Since</label>
              <input
                type="text"
                name="ActingAsAndSince"
                value={formData.ActingAsAndSince}
                onChange={handleInputChange}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
          </div>

        
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#0F67B1',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: 'gray',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        </Box>
      </Modal>



      {/* view fleets */}
      <Modal
      open={isViewFleetsModalOpen}
      onClose={() => setIsViewFleetsModalOpen(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          borderRadius: '20px',
          width: '95vw',
          maxWidth: '1300px',
          maxHeight: '90vh',
          overflow: 'auto',
          p: 4,
        }}
      >
        <h2
          id="modal-title"
          style={{
            textAlign: 'center',
            fontSize: '30px',
            fontWeight: '700',
            background: 'linear-gradient(to right, #1976d2, #42a5f5)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontFamily: 'sans-serif',
          }}
        >
          <i className="fa-solid fa-star" style={{ color: 'gold' }}></i> Fleet Overview{' '}
          <i className="fa-solid fa-star" style={{ color: 'gold' }}></i>
        </h2>
        <hr />

        {/* Filter and Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {/* Organization Filter */}
          <div style={{ width: '250px' }}>
            <label
              htmlFor="fleet-org-select"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              Select Fleet Organization
            </label>
            <FormControl sx={{ width: '100%' }}>
              <Select
                id="fleet-org-select"
                multiple
                value={selectedOrgs}
                onChange={handleOrgChange}
                displayEmpty
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <span style={{ color: '#9e9e9e' }}>
                        -- Select an Organization --
                      </span>
                    );
                  }
                  return selected.join(', ');
                }}
                size="small"
              >
                {orgs.map((org, index) => (
                  <MenuItem key={index} value={org}>
                    <Checkbox checked={selectedOrgs.includes(org)} />
                    <ListItemText primary={org} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Search */}
          <div style={{ width: '250px' }}>
            <label
              htmlFor="fleet-search"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              Search Fleet
            </label>
            <input
              type="text"
              id="fleet-search"
              value={searchedFleets}
              onChange={(e) => setSearchedFleets(e.target.value)}
              placeholder="Search by name, IMO, etc."
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Fleet Table */}
        <div style={{ overflow: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 12px',
              fontFamily: 'Segoe UI, sans-serif',
              cursor: 'pointer',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(to right, #1565c0, #42a5f5)',
                  color: '#fff',
                }}
              >
                {[
                  'Vessel Name',
                  'IMO',
                  'Gross Tonnage',
                  'Ship Type',
                  'Year Of Build',
                  'Current Flag',
                  'Current Class',
                  'Management Office',
                  'Action',
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '14px 18px 20px 0px',
                      fontSize: '17px',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedFleets.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: '#999' }}>
                    NO DATA
                  </td>
                </tr>
              ) : (
                displayedFleets.map((fleet) => (
                  <tr
                    key={fleet._id}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f3f9ff)',
                      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
                      borderRadius: '14px',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <td style={tableCellStyle}>{fleet.VesselName}</td>
                    <td style={tableCellStyle}>{fleet.IMO}</td>
                    <td style={tableCellStyle}>{fleet.GrossTonnage}</td>
                    <td style={tableCellStyle}>{fleet.ShipType}</td>
                    <td style={tableCellStyle}>{fleet.YearOfBuild}</td>
                    <td style={tableCellStyle}>{fleet.CurrentFlag}</td>
                    <td style={tableCellStyle}>{fleet.CurrentClass}</td>
                    <td style={tableCellStyle}>{fleet.ManagementOffice}</td>
                    <td style={tableCellStyle}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(fleet._id)}
                        sx={{
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                          textTransform: 'none',
                        }}
                      >
                        <i className="fa-solid fa-trash fa-bounce" style={{ color: '#F75A5A' }}></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop:"10px"}}>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                sx={{ marginRight: '10px' }}
              >
                Prev
              </Button>
              <span style={{ fontSize: '16px'}}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                sx={{ marginLeft: '10px' }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Box>
    </Modal>

  
{/* fleets loader */}

{loadingBulkSales && (
  <Box
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    bgcolor="rgba(255, 255, 255, 0.5)"
    display="flex"
    flexDirection="column-reverse"  // Reverses the order of the spinner and text
    alignItems="center"
    justifyContent="center"
    zIndex={9999}
  >
     <Typography 
      variant="h6" 
      align="center" 
      gutterBottom 
      mt={2} // Adds a margin-top to the Typography for better spacing
      aria-live="polite"
    >
      Please wait! Fleets Data are being added...
    </Typography>
    <CircularProgress color="primary" size={60} />
   
  </Box>
)}

    </div>
  );
};

// Custom styles for table headers and cells
const tableHeaderStyle = {
  padding: '10px 15px',
  textAlign: 'left',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
};

const tableCellStyle = {
  padding: '10px 15px',
  borderBottom: '1px solid #e0e0e0',
};

export default ViewOrganization;
