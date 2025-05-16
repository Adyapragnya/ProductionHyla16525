/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import {CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Icon, Modal, Box, Typography } from "@mui/material";
import Select from "react-select";
import ArgonBox from "components/ArgonBox";
import { useArgonController } from "context";
import Swal from 'sweetalert2';
import { AuthContext } from "../../AuthContext";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import * as XLSX from 'xlsx';
import { Tooltip} from '@mui/material';
             
function DashCard({ title, count, icon, percentage, onRefresh, onHighlight, vessels, setVessels, setFilteredVessels, onRowClick }) {
const [controller] = useArgonController();
const { darkMode } = controller;
const [vesselAdded,setVesselAdded] = useState([]);
const [vesselsData, setVesselsData] = useState([]);
const [error, setError] = useState(null);
const [showSearchBar, setShowSearchBar] = useState(false);
const [searchInput, setSearchInput] = useState("");
const [dropdownOptions, setDropdownOptions] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [modalOpen, setModalOpen] = useState(false);
const [selectedVesselData, setSelectedVesselData] = useState(null);
const { role,id,loginEmail,adminId} = useContext(AuthContext); 
const [showAddButton, setShowAddButton] = useState(false);
const [loading, setLoading] = useState(false);
const [loadingBulkSales, setLoadingBulkSales] = useState(false);
const [openModal, setOpenModal] = useState(false);
const [openOpsModal, setOpenOpsModal] = useState(false);
const [openSalesModal, setOpenSalesModal] = useState(false);
const [excelData, setExcelData] = useState([]);
const [modalOpenBulkSales, setModalOpenBulkSales] = useState(false);
const [uploadedData, setUploadedData] = useState([]);
const [modalOpenColumnMapping, setModalOpenColumnMapping] = useState(false);
const [modalOpenColumnMappingOPS, setModalOpenColumnMappingOPS] = useState(false);
const [excelHeaders, setExcelHeaders] = useState([]); // Stores extracted column headers
const [appliedFilters, setAppliedFilters] = useState([]);
const [columnMapping, setColumnMapping] = useState({});
const [columnMappingOPS, setColumnMappingOPS] = useState({});
const fixedFields = [
  { key: "SalesQuotationNumber", label: "Sales Quotation Number" },
  { key: "CaseId", label: "Case ID" },
  { key: "SalesResponsible", label: "Sales Responsible" },
  { key: "CustomerOwner", label: "Customer Owner" },
  { key: "VesselName", label: "Vessel Name" },
  { key: "IMO", label: "IMO" },
  { key: "Priority", label: "Priority" },
  { key: "DateOfLastSentQuote", label: "Date Of Last Sent Quote" },
  { key: "Amount", label: "Amount" },
];

const fixedFieldsOPS = [
  { key: "IMO", label: "IMO" },
  { key: "VesselName", label: "Vessel Name" },
  { key: "CaseId", label: "Case ID" },
  { key: "Agent", label: "Agent" },
  { key: "AgentName", label: "Agent Name" },
  { key: "Info1", label: "Info1" },
  { key: "ETA", label: "ETA" },
 
];

// Set showAddButton based on role
useEffect(() => {
  if (role === 'hyla admin') {
    setShowAddButton(true);
  }
}, [role]);

const handleMappingChange = (fixedKey, selectedColumn) => {
  setColumnMapping((prev) => ({ ...prev, [fixedKey]: selectedColumn }));
};

const handleMappingChangeOPS = (fixedKey, selectedColumn) => {
  setColumnMappingOPS((prev) => ({ ...prev, [fixedKey]: selectedColumn }));
};


const applyMapping = async () => {
  // console.log("Column Mapping:", columnMapping);
  // console.log("Excel Data Sample:", excelData.slice(0, 5));

  let vesselNamesSet = new Set();

  // Extract valid vessel names (excluding null, 0, empty, or invalid values)
  excelData.forEach((row) => {
    const mappedColumn = columnMapping["VesselName"];
    let vesselName = mappedColumn && row[mappedColumn] ? String(row[mappedColumn]).trim() : null;

    // Exclude invalid vessel names
    if (vesselName && !["0", "null", "undefined", "unknown", "#N/A", "Invalid Date"].includes(vesselName.toLowerCase())) {
      vesselNamesSet.add(vesselName);
    }
  });
  
  const vesselNames = Array.from(vesselNamesSet);
  // console.log(vesselNames);
  try {
    if (vesselNames.length > 0) {

       const baseURL = process.env.REACT_APP_API_BASE_URL;

      const response = await fetch(`${baseURL}/api/match-imo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vesselNames }),
      });
    
      const { imoMapping } = await response.json();
      // console.log("IMO Mapping:", imoMapping);

      // Process data and add IMO numbers
      const processedData = excelData.map((row) => {
        let newRow = {};

        fixedFields.forEach((field) => {
          const mappedColumn = columnMapping[field.key];
          newRow[field.key] = mappedColumn && row.hasOwnProperty(mappedColumn) ? row[mappedColumn] ?? null : null;
        });

        // Add IMO Number if vessel name is valid
        let vesselName = newRow["VesselName"] ? String(newRow["VesselName"]).trim() : null;

        newRow["IMO"] = vesselName && imoMapping[vesselName] ? imoMapping[vesselName] : null;

        return newRow;
      });

      // console.log("Processed Data:", processedData);
      setUploadedData(processedData);
    } else {
      console.warn("No valid vessel names to fetch IMO numbers.");
    }
  } catch (error) {
    console.error("Error fetching IMO numbers:", error);
  }

  setModalOpenColumnMapping(false);
  setModalOpenBulkSales(true);
};

const applyMappingOPS = async () => {
  // console.log("Column Mapping:", columnMappingOPS);
  // console.log("Excel Data Sample:", excelData.slice(0, 5));

  let vesselNamesSet = new Set();

  // Extract valid vessel names (excluding null, 0, empty, or invalid values)
  excelData.forEach((row) => {
    const mappedColumn = columnMappingOPS["VesselName"];
    let vesselName = mappedColumn && row[mappedColumn] ? String(row[mappedColumn]).trim() : null;

    // Exclude invalid vessel names
    if (vesselName && !["0", "null", "undefined", "unknown", "#N/A", "Invalid Date"].includes(vesselName.toLowerCase())) {
      vesselNamesSet.add(vesselName);
    }
  });

  const vesselNames = Array.from(vesselNamesSet);
  // console.log(vesselNames);
  try {
    if (vesselNames.length > 0) {

       const baseURL = process.env.REACT_APP_API_BASE_URL;

      const response = await fetch(`${baseURL}/api/match-imo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vesselNames }),
      });
    
      const { imoMapping } = await response.json();

      // Process data and add IMO numbers
      const processedData = excelData.map((row) => {
        let newRow = {};

        fixedFieldsOPS.forEach((field) => {
          const mappedColumn = columnMappingOPS[field.key];
          newRow[field.key] = mappedColumn && row.hasOwnProperty(mappedColumn) ? row[mappedColumn] ?? null : null;
        });

        // Add IMO Number if vessel name is valid
        let vesselName = newRow["VesselName"] ? String(newRow["VesselName"]).trim() : null;

        newRow["IMO"] = vesselName && imoMapping[vesselName] ? imoMapping[vesselName] : null;

        return newRow;
      });

      // console.log("Processed Data:", processedData);
      setUploadedData(processedData);
    } else {
      console.warn("No valid vessel names to fetch IMO numbers.");
    }
  } catch (error) {
    console.error("Error fetching IMO numbers:", error);
  }

  setModalOpenColumnMappingOPS(false);
  // setModalOpenBulkSales(true);
  setOpenModal(true);
};


  const handleAddSalesData = async () => {
    try {
      setModalOpenBulkSales(false); // Close the modal
      setOpenSalesModal(false);
      setLoadingBulkSales(true);

      const baseURL = process.env.REACT_APP_API_BASE_URL;

      // Prepare requestBody2
      const requestBody2 = uploadedData.map(row => ({
        loginUserId: id,
        email: loginEmail,
        IMO: row.IMO,
        AdminId: adminId,
        OrgId: (role === 'organizational user' || role === 'organization admin') 
          ? (id.includes('_') ? id.split('_')[1] : id.split('_')[0]) 
          : null,
        AddedDate: new Date().toISOString(),
      }));

      // Combine uploadedData and requestBody2
      const combinedData = uploadedData.map((row, index) => ({
        ...row,
        ...requestBody2[index],
      }));

    // ✅ Check if combinedData is empty before proceeding
    if (combinedData.length === 0) {
      Swal.fire({
        title: "No Data Found",
        text: "Please match the Excel data correctly before uploading.",
        icon: "warning",
        confirmButtonText: "OK",
        zIndex:9999,
      });
      setLoadingBulkSales(false);
      return; // Stop execution
    }

       // Chunking logic to avoid backend overload
    const chunkSize = 200;
  
    for (let i = 0; i < combinedData.length; i += chunkSize) {
      const chunk = combinedData.slice(i, i + chunkSize);
      const chunkIndex = Math.floor(i / chunkSize); // Calculate chunk index dynamically
      const isLastChunk = i + chunkSize >= combinedData.length; // Check if this is the last chunk

      try {
        const response = await axios.post(`${baseURL}/api/upload-sales-data`, chunk, {
          headers: { "Content-Type": "application/json", "chunk-index": chunkIndex.toString(), "is-last-chunk": isLastChunk.toString() },
        });
        // console.log(`Chunk ${chunkIndex} uploaded:`, response.data);
      } catch (error) {
        console.error(`Error uploading chunk ${chunkIndex}:`, error.response?.data || error.message);

        Swal.fire({
          title: "Upload Failed",
          text: `Chunk ${chunkIndex} failed. Fix the issue and retry.`,
          icon: "error",
          zIndex:9999,
        });

        setLoadingBulkSales(false);
        return; // Stop further uploads if one chunk fails
      }
    }



      // Display success message
      Swal.fire({
        title: "Success!",
        text: "Bulk Sales Data added successfully.",
        icon: "success",
        confirmButtonText: "OK",
        zIndex:9999,
      });
      setLoadingBulkSales(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to add bulk sales data.",
        icon: "error",
        confirmButtonText: "Retry",
        zIndex:9999,
      });
      console.error("Error sending data to the backend:", error);
      setLoadingBulkSales(false);
    }
  }

  const handleAddOpsData = async () => {
    try{
    handleCloseModalExcelUpload();
    setOpenOpsModal(false);
    setLoading(true); // Start loading spinner

    const baseURL = process.env.REACT_APP_API_BASE_URL;

    const requestBody3 = uploadedData.map(row => ({ 
      loginUserId: id,
      email: loginEmail, 
      IMO: row.IMO,
      AdminId: adminId,
      OrgId: (role === 'organizational user' || role === 'organization admin') 
             ? (id.includes('_') ? id.split('_')[1] : id.split('_')[0]) 
             : null,
      // AddedDate: new Date().toISOString(),
    }));

    // Combine uploadedData and requestBody2
    const combinedOpsData = uploadedData.map((row, index) => ({
      ...row,
      ...requestBody3[index],
    }));

    // console.log('ops-data-from-excel',combinedOpsData);

        // ✅ Check if combinedData is empty before proceeding
        if (combinedOpsData.length === 0) {
          Swal.fire({
            title: "No Data Found",
            text: "Please match the Excel data correctly before uploading.",
            icon: "warning",
            confirmButtonText: "OK",
            zIndex:9999,
          });
          setLoading(false);
          return; // Stop execution
        }
    
 
           // Chunking logic to avoid backend overload
        const chunkSize = 200;
    
        for (let i = 0; i < combinedOpsData.length; i += chunkSize) {
          const chunk = combinedOpsData.slice(i, i + chunkSize);
          const chunkIndex = Math.floor(i / chunkSize); // Calculate chunk index dynamically
    
          try {

    const response = await axios.post(`${baseURL}/api/upload-ops-data-bulk`, chunk, {
      headers: { "Content-Type": "application/json", "chunk-index": chunkIndex.toString() },
    });
  
    // console.log(`ops Chunk ${chunkIndex} uploaded:`, response.data);

  } catch (error) {

    console.error(`Error uploading chunk ${chunkIndex}:`, error.response?.data || error.message);
    Swal.fire({
      title: "Upload Failed",
      text: `Chunk ${chunkIndex} failed. Fix the issue and retry.`,
      icon: "error",
      zIndex:9999,
    });

    setLoading(false);
    return;
  }
}

      // Display success message
      Swal.fire({
        title: "Success!",
        text: "Bulk OPS Data added successfully.",
        icon: "success",
        confirmButtonText: "OK",
        zIndex:9999,
      });
      setLoading(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to add bulk ops data.",
        icon: "error",
        confirmButtonText: "Retry",
        zIndex:9999,
      });
      console.error("Error sending data to the backend:", error);
      setLoading(false);
    }
  }



  const handleOpsExcelUpload = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Extract as rows (arrays)
  
        // console.log("Raw Excel Data:", jsonData);
  
        if (jsonData.length < 2) {
          console.error("Excel file is empty or not formatted properly!");
          return;
        }
  
        const headers = jsonData[0]; // Extract headers
        let dataRows = [];
        let filtersSection = [];
  
        // Helper function to convert Excel serial date to JS Date
        const excelDateToJSDate = (serial) => {
          if (typeof serial !== "number") return null; // Ensure it's a number
          const utc_days = serial - 25569; // Excel's base date is 1899-12-30
          const utc_value = utc_days * 86400 * 1000; // Convert to milliseconds
          const date_info = new Date(utc_value);
          return isNaN(date_info.getTime()) ? null : date_info;
        };
  
        // Function to clean invalid values
        const cleanValue = (value) => {
          if (
            value === undefined || 
            value === null || 
            value === "" || 
            value.toString().trim().toLowerCase() === "unknown" || 
            value.toString().trim().toLowerCase() === "#n/a" || 
            value.toString().trim().toLowerCase() === "invalid date"
          ) {
            return null;
          }
          return value;
        };
  
        // Iterate through rows, stopping at "Total"
        for (let i = 1; i < jsonData.length; i++) {
          let row = jsonData[i];
  
          // Stop processing when "Total" appears in any column
          if (row.some((cell) => String(cell).toLowerCase().includes("total"))) {
            filtersSection = jsonData.slice(i + 1); // Store remaining rows as filters
            break;
          }
  
          let obj = {};
          headers.forEach((header, index) => {
            let cellValue = row[index];
  
            if (header.trim().toLowerCase().includes("date")) {
              // console.log(`Raw Date value for row ${i}:`, cellValue);
  
              if (typeof cellValue === "number") {
                // If it's a number, convert from Excel serial date
                const jsDate = excelDateToJSDate(cellValue);
                obj[header.trim()] = cleanValue(jsDate ? jsDate.toLocaleDateString("en-GB") : null);
              } else if (typeof cellValue === "string" && new Date(cellValue).toString() !== "Invalid Date") {
                // If it's a string, check if it's a valid date
                obj[header.trim()] = cleanValue(new Date(cellValue).toLocaleDateString("en-GB"));
              } else {
                obj[header.trim()] = null; // Invalid date
              }
            } else {
              obj[header.trim()] = cleanValue(cellValue);
            }
          });
  
          dataRows.push(obj);
        }
  
        // console.log("Parsed Data (Before Total Row):", dataRows);
        // console.log("Applied Filters:", filtersSection);
  
        setExcelHeaders(headers);
        setExcelData(dataRows);
        setAppliedFilters(filtersSection); // Store filters separately
        setModalOpenColumnMappingOPS(true); // Open mapping UI
      };
  
      reader.readAsBinaryString(file);
    }
  };

  const handleSalesExcelUpload = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Extract as rows (arrays)
  
        // console.log("Raw Excel Data:", jsonData);
  
        if (jsonData.length < 2) {
          console.error("Excel file is empty or not formatted properly!");
          return;
        }
  
        const headers = jsonData[0]; // Extract headers
        let dataRows = [];
        let filtersSection = [];
  
        // Helper function to convert Excel serial date to JS Date
        const excelDateToJSDate = (serial) => {
          if (typeof serial !== "number") return null; // Ensure it's a number
          const utc_days = serial - 25569; // Excel's base date is 1899-12-30
          const utc_value = utc_days * 86400 * 1000; // Convert to milliseconds
          const date_info = new Date(utc_value);
          return isNaN(date_info.getTime()) ? null : date_info;
        };
  
        // Function to clean invalid values
        const cleanValue = (value) => {
          if (
            value === undefined || 
            value === null || 
            value === "" || 
            value.toString().trim().toLowerCase() === "unknown" || 
            value.toString().trim().toLowerCase() === "#n/a" || 
            value.toString().trim().toLowerCase() === "invalid date"
          ) {
            return null;
          }
          return value;
        };
  
        // Iterate through rows, stopping at "Total"
        for (let i = 1; i < jsonData.length; i++) {
          let row = jsonData[i];
  
          // Stop processing when "Total" appears in any column
          if (row.some((cell) => String(cell).toLowerCase().includes("total"))) {
            filtersSection = jsonData.slice(i + 1); // Store remaining rows as filters
            break;
          }
  
          let obj = {};
          headers.forEach((header, index) => {
            let cellValue = row[index];
  
            if (header.trim().toLowerCase().includes("date")) {
              // console.log(`Raw Date value for row ${i}:`, cellValue);
  
              if (typeof cellValue === "number") {
                // If it's a number, convert from Excel serial date
                const jsDate = excelDateToJSDate(cellValue);
                obj[header.trim()] = cleanValue(jsDate ? jsDate.toLocaleDateString("en-GB") : null);
              } else if (typeof cellValue === "string" && new Date(cellValue).toString() !== "Invalid Date") {
                // If it's a string, check if it's a valid date
                obj[header.trim()] = cleanValue(new Date(cellValue).toLocaleDateString("en-GB"));
              } else {
                obj[header.trim()] = null; // Invalid date
              }
            } else {
              obj[header.trim()] = cleanValue(cellValue);
            }
          });
  
          dataRows.push(obj);
        }
  
        // console.log("Parsed Data (Before Total Row):", dataRows);
        // console.log("Applied Filters:", filtersSection);
  
        setExcelHeaders(headers);
        setExcelData(dataRows);
        setAppliedFilters(filtersSection); // Store filters separately
        setModalOpenColumnMapping(true); // Open mapping UI
      };
  
      reader.readAsBinaryString(file);
    }
  };


  
  // sales end


  const handleSearchChange = (value) => {
    setSearchInput(value);
    setPage(1); // Reset page when search input changes
  };

  const handleToggleSearchBar = () => {
    setShowSearchBar((prevShowSearchBar) => !prevShowSearchBar);
  };

  // Extract ops data and send to backend


const generateOpsTemplate = () => {
  // Define the column headers as per the HTML structure you provided
  const templateData = [
    { VesselName: '', CaseId: '', Agent: '', AgentName: '', Info1: '', ETA: '' }, // Empty row for template
  ];

  // Generate the worksheet with the template data
  const ws = XLSX.utils.json_to_sheet(templateData, {
    header: ['VesselName', 'CaseId', 'Agent', 'AgentName', 'Info1', 'ETA'], // Define custom column headers
  });

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Generate and download the Excel file
  XLSX.writeFile(wb, 'bulk_ops_template.xlsx');
};



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

const generateSalesTemplate = () => {
  // Define the column headers as per the HTML structure you provided
  const templateData = [
    { SalesQuotationNumber: '', CaseId: '', SalesResponsible: '', CustomerOwner: '', VesselName: '', Priority: '', DateOfLastSentQuote:'' , Amount:'' }, // Empty row for template
  ];

  // Generate the worksheet with the template data
  const ws = XLSX.utils.json_to_sheet(templateData, {
    header: ['SalesQuotationNumber', 'CaseId', 'SalesResponsible', 'CustomerOwner', 'VesselName', 'Priority', 'DateOfLastSentQuote', 'Amount'  ], // Define custom column headers
  });

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Generate and download the Excel file
  XLSX.writeFile(wb, 'bulk_sales_template.xlsx');
};

  const handleCloseModalExcelUpload = () => setOpenModal(false);
  
  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      const vesselData = vesselsData.find(vessel => vessel.imoNumber === selectedOption.value);
      setSelectedVesselData(vesselData);
      // console.log(vesselData)
      setModalOpen(true);
    }
  };
  
  // commented on 26-04-2025
  // const fetchVesselData = async (imoNumber) => {
  //   try {
  //     const baseURL = process.env.REACT_APP_API_BASE_URL;
  //     const response = await axios.get(`${baseURL}/api/ais-data`, {
  //       params: { imo: imoNumber }
  //     });
  //     setSelectedVesselData(response.data);
  //     setModalOpen(true);
  //   } catch (err) {
  //     console.error("Error fetching vessel data:", err);
  //   }
  // };
  
  useEffect(() => {
    const fetchVesselData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
  
        // Step 1: Derive orgId from `id` based on the underscore count
        let orgId = id.includes('_') ? id.split('_')[1] : id.split('_')[0];
       
        // Step 2: Fetch organization data for assignShips count
        const orgResponse = await axios.get(`${baseURL}/api/organizations/getAvailableVessels/${orgId}`);
         console.log(orgResponse);
        const vesselLimit = orgResponse.data?.vesselLimit || 0;
  
        // Step 3: Fetch all vessels to filter by `orgId`
        const vesselResponse = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
        const filteredVessels = vesselResponse.data.filter(vessel =>
          vessel.loginUserId && vessel.loginUserId.includes(orgId)
        );

        setShowAddButton(vesselLimit > filteredVessels.length);
      } catch (error) {
        console.error('Error fetching vessel or organization data:', error);
      }
    };

    const fetchGuestVesselData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
  
         
        // Step 1: Fetch the guest vessel limit
        const limitResponse = await axios.get(`${baseURL}/api/settings/users-management/guest-vessel-limit`);
        const vesselLimit = limitResponse.data.vesselLimit;

        console.log(limitResponse);  
  
        // Step 3: Fetch all vessels to filter by `orgId`
        const vesselResponse = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
        const filteredVessels = vesselResponse.data.filter(vessel =>
          vessel.loginUserId === id
        );
        
        setShowAddButton(vesselLimit > filteredVessels.length);
      } catch (error) {
        console.error('Error fetching vessel or organization data:', error);
      }
    };
  
    // Fetch data only if the user has an organizational role
    if (role === 'organizational user' || role === 'organization admin' ) {
      fetchVesselData();
    }

    if (role === 'guest'){
      fetchGuestVesselData();
    }
  }, [ vessels]);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-vessels`, {
          params: { search: searchInput, page, limit: 20 }
        });

        if (response.data.vessels.length < 20) {
          setHasMore(false);
        }

        const options = response.data.vessels.map(vessel => ({
          value: vessel.imoNumber,
          label: vessel.transportName + " | " + vessel.SpireTransportType
        }));
        setDropdownOptions(options);

        setVesselsData(prevVessels => [...prevVessels, ...response.data.vessels]);
      } catch (err) {
        console.error("Error fetching vessel data:", err);
        setError(err.message);
      }
    };

    if (searchInput && showSearchBar) {
      fetchVessels();
    } else {
      setDropdownOptions([]);
    }
  }, [searchInput, showSearchBar, page]);

   // Reset search input and dropdown options when `showAddButton` changes
   useEffect(() => {
    setSearchInput("");
    setDropdownOptions([]);
  }, [showAddButton]);

  const loadMore = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVesselData(null);
  };

  
  const handleAddToTrack = async () => {
    if (!selectedVesselData) return;
  
    const imoNumber = selectedVesselData.imoNumber;

  // ✅ Local check before anything else
  const alreadyExistsLocally = vessels?.some(v => v.imo === imoNumber);
  if (alreadyExistsLocally) {
    handleCloseModal();
    Swal.fire({
      title: 'Already Tracked',
      text: 'This vessel is already in your tracked list.',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      zIndex:9999,
    });
    return;
  }

  try {
      const baseURL = process.env.REACT_APP_API_BASE_URL; 
      handleCloseModal();
  
      await new Promise(resolve => setTimeout(resolve, 300));
   
      const result = await Swal.fire({
        title: 'Confirm',
        text: "Are you sure you want to add this vessel to the track?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, add it!',
        zIndex:9999,
      });
     
      if (result.isConfirmed) {
        
        const imoNumber = selectedVesselData.imoNumber;
        // Check if the vessel is already being tracked
        const trackedVesselsResponse = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        // console.log(trackedVesselsResponse.data);
        const isAlreadyTracked = trackedVesselsResponse.data.some(doc => doc.IMO === imoNumber);


        if (isAlreadyTracked) {

          
    
        const vesselNameValue = trackedVesselsResponse.data.filter(vessel => vessel.IMO === imoNumber);

        // console.log(vesselNameValue);
              const requestBody2 = { 
                loginUserId: id,
                email: loginEmail, 
                IMO: imoNumber,
                AdminId: adminId,
                OrgId: (role === 'organizational user' || role === 'organization admin') 
                       ? (id.includes('_') ? id.split('_')[1] : id.split('_')[0]) 
                       : null,
                AddedDate: new Date().toISOString(),
                vesselName: vesselNameValue[0].AIS?.NAME
              
              };
              
        
          try {
            // console.log(requestBody2);
            const response= await axios.post(`${baseURL}/api/add-vessel-tracked-by-user`, requestBody2);
            // console.log(requestBody2);

            const vesselData= response.data.vessel;
            console.log(vesselData);
              // Add vessel to both state arrays
                const vessel = {
        imo: imoNumber,
        SpireTransportType: vesselData?.SpireTransportType || '',
        name: vesselData.AIS?.NAME || "-",
        speed: vesselData.AIS?.SPEED || 0,
        lat: vesselData.AIS?.LATITUDE || 0,
        lng: vesselData.AIS?.LONGITUDE || 0,
        heading: vesselData.AIS?.HEADING || 0,
        status: vesselData.AIS?.NAVSTAT || 0,
        eta: vesselData.AIS?.ETA || 0,
        destination: vesselData.AIS?.DESTINATION || '',
        zone: vesselData.AIS?.ZONE || '',
        port: vesselData.AIS?.LOCODE || ''
      };

      setVessels(prevVessels => [...prevVessels, vessel]);
      setFilteredVessels(prevFiltered => [...prevFiltered, vessel]);

      onRowClick({
        name: vessel.name,
        imo: vessel.imo,
        lat: vessel.lat,
        lng: vessel.lng,
        speed: vessel.speed,
        heading: vessel.heading,
        eta: vessel.eta,
        destination: vessel.destination,
        SpireTransportType: vessel.SpireTransportType
      });

              
            await axios.post(`${baseURL}/api/add-Ops-data-for-adding-vessel`, requestBody2);
            Swal.fire({
              title: 'Success',
              text: 'Vessel added to track successfully!',
              icon: 'success',
              confirmButtonColor: '#3085d6',
              zIndex:9999,
            });
//             if (onRefresh) {
//   await onRefresh(); // Ensure it's awaited in case it's async
// }


            // close search bar

            setShowSearchBar((prevShowSearchBar) => !prevShowSearchBar);
          } catch (error) {
            console.error('Error posting to add-vessel-tracked-by-user:', error.response ? error.response.data : error.message);
          }
        } else {
          // Fetch AIS data and add combined data
          const aisResponse = await axios.get(`${baseURL}/api/ais-data`, {
            params: { imo: imoNumber }
          });
          // console.log(aisResponse);
  
          const requestBody = {
            IMO: imoNumber,
            ...aisResponse.data,
            SpireTransportType: selectedVesselData.SpireTransportType,
            FLAG: selectedVesselData.FLAG,
            GrossTonnage: selectedVesselData.GrossTonnage,
            deadWeight: selectedVesselData.deadWeight,
            email: loginEmail,
          };



          const token = localStorage.getItem('token');
          await axios.post(`${baseURL}/api/add-combined-data`, requestBody);
          // console.log('Combined data added successfully');
  
         
          if (onHighlight) onHighlight({
            imo: imoNumber,
            lat: aisResponse.data[0].AIS.LATITUDE,
            lng: aisResponse.data[0].AIS.LONGITUDE,
            name: aisResponse.data[0].AIS.NAME,
            eta: aisResponse.data[0].AIS.ETA,
            destination: aisResponse.data[0].AIS.DESTINATION
          });

       

          


          Swal.fire({
            title: 'Success',
            text: 'Vessel added to track successfully!',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            zIndex:9999,
          });
          // if (onRefresh) {
          //   await onRefresh(); // Ensure it's awaited in case it's async
          // }
          
            // close search bar

            setShowSearchBar((prevShowSearchBar) => !prevShowSearchBar);

            const trackedVesselsResponse = await axios.get(`${baseURL}/api/get-tracked-vessels`);

            const vesselNameValue = trackedVesselsResponse.data.filter(vessel => vessel.IMO === imoNumber);

            // console.log(vesselNameValue);
                  const requestBody2 = { 
                    loginUserId: id,
                    email: loginEmail, 
                    IMO: imoNumber,
                    AdminId: adminId,
                    OrgId: (role === 'organizational user' || role === 'organization admin') 
                           ? (id.includes('_') ? id.split('_')[1] : id.split('_')[0]) 
                           : null,
                    AddedDate: new Date().toISOString(),
                    vesselName: vesselNameValue[0].AIS?.NAME
                  
                  };
  
          try {

            
   
            const response =  await axios.post(`${baseURL}/api/add-vessel-tracked-by-user`, requestBody2);
            const vesselData= response.data.vessel;
            console.log(vesselData);
              // Add vessel to both state arrays
                  const vessel = {
            imo: imoNumber,
            SpireTransportType: vesselData?.SpireTransportType || '',
            name: vesselData.AIS?.NAME || "-",
            speed: vesselData.AIS?.SPEED || 0,
            lat: vesselData.AIS?.LATITUDE || 0,
            lng: vesselData.AIS?.LONGITUDE || 0,
            heading: vesselData.AIS?.HEADING || 0,
            status: vesselData.AIS?.NAVSTAT || 0,
            eta: vesselData.AIS?.ETA || 0,
            destination: vesselData.AIS?.DESTINATION || '',
            zone: vesselData.AIS?.ZONE || '',
            port: vesselData.AIS?.LOCODE || ''
          };

          setVessels(prevVessels => [...prevVessels, vessel]);
          setFilteredVessels(prevFiltered => [...prevFiltered, vessel]);

            onRowClick({
        name: vessel.name,
        imo: vessel.imo,
        lat: vessel.lat,
        lng: vessel.lng,
        speed: vessel.speed,
        heading: vessel.heading,
        eta: vessel.eta,
        destination: vessel.destination,
        SpireTransportType: vessel.SpireTransportType
      });
            await axios.post(`${baseURL}/api/add-Ops-data-for-adding-vessel`, requestBody2);
            // console.log(requestBody2);
          } catch (error) {
            console.error('Error posting to add-vessel-tracked-by-user:', error.response ? error.response.data : error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error adding data to track:', error);
    }
  };
  

  return (
    <ArgonBox>

      {/* Full-page Loading Spinner Overlay */}
{loading && (
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
      Please wait! Ops data are being added...
    </Typography>
    <CircularProgress color="primary" size={60} />
   
  </Box>
)}



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
      Please wait! Sales Data are being added...
    </Typography>
    <CircularProgress color="primary" size={60} />
   
  </Box>
)}
      
      <ArgonBox p={0}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={0}>
          <Grid item xs={12} lg={6} style={{ display: "flex", justifyContent: "left" }}>
            <h3 style={{ margin: 0 }}>Vessel Details</h3>
          </Grid>

          {showSearchBar && (
 <Grid item xs={12} lg={2.8} style={{ position: 'relative' }}>
 <Select
 options={dropdownOptions}
 placeholder="Select vessel"
 onInputChange={handleSearchChange}
 onChange={handleSelectChange}
 isSearchable={true}
 isClearable={true}
 />
 </Grid>
 )}

<Grid item xs={12} lg={3} gap={0.5} style={{ display: "flex",flexDirection: window.innerWidth < 600 ? "column" : "row",   justifyContent: "flex-end" }}>
    {showAddButton ?   (
      <Button
        variant="contained"
        color="primary"
        style={{
          backgroundColor: "#0F67B1",
          color: "white",
          borderRadius: "5px",
          padding: "4px 6px",
        }}
        onClick={handleToggleSearchBar}
        
      >
        <i className="fa-solid fa-ship"></i>&nbsp;Add Vessel
      </Button>
    )  :
    (
      <Tooltip title="Vessel limit reached"  arrow  style={{color:'white'}}>
        <span>

      <Button
      variant="contained"
      color="primary"
      startIcon={<Icon>add</Icon>}
      style={{
        backgroundColor: "#0F67B1",
        color: "white",
        borderRadius: "5px",
        padding: "4px 6px",
      }}
      onClick={handleToggleSearchBar}
      disabled
    >
      Add Vessel
    </Button>
    </span>
    </Tooltip>
    )
    }

{/* ops bulk start here */}

  { (role === "hyla admin" || role === "organization admin"  )  &&   (
      <label htmlFor="excel-upload">
        <Button
          variant="contained"
          color="primary"
          // startIcon={<Icon>upload_file</Icon>}
          style={{
            backgroundColor: "#0F67B1",
            color: "white",
            borderRadius: "5px",
            padding: "4px 6px",
          }}
          
          onClick={() => setOpenOpsModal(true)}
        >
         OPS Upload
        </Button>
      </label>
  )}

    <Modal open={openOpsModal} onClose={() => setOpenOpsModal(false)} style={{ zIndex: 9999 }}>
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
        <h3>Download Template & Upload</h3>


           {/* Notes Section */}
           <Box sx={{ marginTop: 2, textAlign: 'left', fontSize: '14px', color: 'gray' }}>
  <ul style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
    <li>Click &quot;Download Ops Template&quot; to get an Excel file.</li>
    <li>Fill the required data in the template.</li>
    <li>After filling out the template, click &quot;Upload Ops Data&quot; to submit the file.</li>
  </ul>
</Box>

        <Box sx={{marginTop:4 , display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateOpsTemplate}
          style={{
            backgroundColor: "#0F67B1",
            color: "white",
            borderRadius: "5px",
            padding: "10px 15px",
            width: '100%',
          }}
        >
          Download Ops Template
        </Button>

 {/* Button to trigger file upload */}
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
          onClick={() => document.getElementById('excel-upload').click()} // Trigger file input click
        >
          Upload Ops Data
        </Button>
    </Box>  

        {/* Hidden file input */}
        <input
          type="file"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          id="excel-upload"
          onChange={handleOpsExcelUpload}
        />

        {/* Hidden file input */}
      

      </Box>
    </Modal>

    <Modal open={openModal} onClose={handleCloseModalExcelUpload} aria-labelledby="modal-title" aria-describedby="modal-description" style={{ zIndex: 9999 }}>
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
  
  <h2 id="modal-title">Uploaded Ops Data</h2>
       
  
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: "left"  }}>
      <thead>
        <tr>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
          {fixedFieldsOPS.map((field) => (
            <th key={field.key} style={{ padding: "8px", border: "1px solid #ddd" }}>{field.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {uploadedData.map((row, index) => (
          <tr key={index}>
              <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>{index + 1}</td> 
            {fixedFieldsOPS.map((field) => (
              <td key={field.key} style={{ padding: "8px", border: "1px solid #ddd" }}>
                {row[field.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Add Vessels Button aligned to the right */}
    <Box sx={{ textAlign: "right" }}>
    <Button
          variant="contained"
          color="primary"
          onClick={handleAddOpsData}
          style={{
            margin: "20px auto", // auto left/right margins centers the button
            display: "block",    // makes the margin auto work as expected
            borderRadius: "8px",
            color: "white"
          }}
      >
  Add Ops
</Button>

    </Box>
  </Box>
</Modal>

{/* ops bulk ends here */}

      {/*  sales bulk starts */}
   
      { (role === "hyla admin" || role === "organization admin"  )  &&   (
      <label htmlFor="excel-upload" style={{ cursor: "pointer" }}>
        <Button
          variant="contained"
          color="primary"
          // startIcon={<Icon>upload_file</Icon>}
          style={{
            backgroundColor: "#0F67B1",
            color: "white",
            borderRadius: "5px",
            padding: "4px 6px",
          }}
          onClick={() => setOpenSalesModal(true)}
        
        >
         Sales Upload
        </Button>
      </label>
      )}

<Modal open={modalOpenColumnMapping} onClose={() => setModalOpenColumnMapping(false)} style={{ zIndex: 9999 }}>
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
      width: "600px",
    }}
  >
     <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
      Match Excel Columns
    </h2>

    {fixedFields
    .filter((field) => field.key !== "IMO") // Exclude IMO from selection
    .map((field, index) => (
      <Box key={index} sx={{ marginBottom: 2 }}>
           <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            {field.label}:
          </label>
        <select
          onChange={(e) => handleMappingChange(field.key, e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
      
      >
          <option value="">Select Column</option>
          {excelHeaders.map((header, idx) => (
            <option key={idx} value={header}>{header}</option>
          ))}
        </select>
      </Box>
    ))}
    <Button variant="contained" color="primary" onClick={applyMapping}
      sx={{
        width: "100%",
        marginTop: 2,
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#1976d2",
        "&:hover": { backgroundColor: "#115293" },
      }}
    >
      Apply Mapping
    </Button>
  </Box>
</Modal>


<Modal open={modalOpenColumnMappingOPS} onClose={() => setModalOpenColumnMappingOPS(false)} style={{ zIndex: 9999 }}>
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
      width: "600px",
    }}
  >
     <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
      Match Excel Columns
    </h2>

    {fixedFieldsOPS
    .filter((field) => field.key !== "IMO") // Exclude IMO from selection
    .map((field, index) => (
      <Box key={index} sx={{ marginBottom: 2 }}>
           <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            {field.label}:
          </label>
        <select
          onChange={(e) => handleMappingChangeOPS(field.key, e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
      
      >
          <option value="">Select Column</option>
          {excelHeaders.map((header, idx) => (
            <option key={idx} value={header}>{header}</option>
          ))}
        </select>
      </Box>
    ))}
    <Button variant="contained" color="primary" onClick={applyMappingOPS}
      sx={{
        width: "100%",
        marginTop: 2,
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#1976d2",
        "&:hover": { backgroundColor: "#115293" },
      }}
    >
      Apply Mapping
    </Button>
  </Box>
</Modal>
     
<Modal open={openSalesModal} onClose={() => setOpenSalesModal(false)} style={{ zIndex: 9999 }}>
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
        <h3>Download Template & Upload</h3>


           {/* Notes Section */}
           <Box sx={{ marginTop: 2, textAlign: 'left', fontSize: '14px', color: 'gray' }}>
  <ul style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
    <li>Click &quot;Download Sales Template&quot; to get an Excel file.</li>
    <li>Fill the required data in the template.</li>
    <li>After filling out the template, click &quot;Upload Sales Data&quot; to submit the file.</li>
  </ul>
</Box>



        <Box sx={{marginTop:4 , display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
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
          Download Sales Template
        </Button>


 {/* Button to trigger file upload */}
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
          onClick={() => document.getElementById('excel-upload').click()} // Trigger file input click
        >
          Upload Sales Data
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
{/* 
  <Modal
        open={modalOpenBulkSales}
        onClose={() => setModalOpenBulkSales(false)}
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
          <h2 id="modal-title">Uploaded Sales Data</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Sales Quotation Number</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Case ID</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Sales Responsible</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Customer Owner</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Vessel Name</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>IMO</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Priority</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date Of Last Sent Quote</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {uploadedData.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.SalesQuotationNumber}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.CaseId}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.SalesResponsible}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.CustomerOwner}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.VesselName}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.IMO}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.Priority}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.DateOfLastSentQuote}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.Amount}</td>
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
            Add Sales
          </Button>
        </Box>

        </Box>
      </Modal> */}


<Modal open={modalOpenBulkSales} onClose={() => setModalOpenBulkSales(false)} style={{ zIndex: 9999 }}>
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
    <h2>Uploaded Sales Data</h2>
  
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: "left"  }}>
      <thead>
        <tr>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
          {fixedFields.map((field) => (
            <th key={field.key} style={{ padding: "8px", border: "1px solid #ddd" }}>{field.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {uploadedData.map((row, index) => (
          <tr key={index}>
              <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>{index + 1}</td> 
            {fixedFields.map((field) => (
              <td key={field.key} style={{ padding: "8px", border: "1px solid #ddd" }}>
                {row[field.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    <Box sx={{ textAlign: "right" }}>
      <Button variant="contained" color="primary" onClick={handleAddSalesData} style={{ marginTop: "20px", borderRadius: "8px", color: "white" }}>
        Add Sales
      </Button>
    </Box>
  </Box>
</Modal>

      {/*  sales bulk ends */}

      {/* end */}
  </Grid>
  </Grid>
</ArgonBox>

<Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" style={{ zIndex: 9999 }}>
  <DialogTitle
    style={{
      textAlign: 'center',  
      fontWeight: 'bold',
      fontSize: '1.7rem',
      padding: '16px',
      background: 'linear-gradient(90deg, #6dd5ed, #205295)',
      color: 'white',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px'
    }}
  >
    Vessel Information
  </DialogTitle>
  <DialogContent style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)', padding: '24px' }}>
    {selectedVesselData ? (
      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'linear-gradient(90deg, #6dd5ed, #205295)', color: 'white' }}>
            <tr>
              <th style={{ padding: '14px', border: '1px solid #e0e0e0', textAlign: 'left' }}>IMO Number</th>
              <th style={{ padding: '14px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Vessel Type</th>
              <th style={{ padding: '14px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Vessel Name</th>
              <th style={{ padding: '14px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Deadweight</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#ffffff' }}>
              <td style={{ padding: '14px', border: '1px solid #f0f0f0' }}>{selectedVesselData.imoNumber}</td>
              <td style={{ padding: '14px', border: '1px solid #f0f0f0' }}>{selectedVesselData.SpireTransportType}</td>
              <td style={{ padding: '14px', border: '1px solid #f0f0f0' }}>{selectedVesselData.transportName}</td>
              <td style={{ padding: '14px', border: '1px solid #f0f0f0' }}>{selectedVesselData.deadWeight}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ) : (
      <p style={{ textAlign: 'center', color: '#888' }}>No data available</p>
    )}
  </DialogContent>
  <DialogActions style={{ justifyContent: 'space-between', padding: '16px 24px', background: '#f7f9fb' }}>
    <Button
      onClick={handleCloseModal}
      style={{
        background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}
    >
      Close
    </Button>
    <Button
      onClick={handleAddToTrack}
      style={{
        background: 'linear-gradient(to right, #6dd5ed, #205295)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}
    >
      Add to Track
    </Button>
  </DialogActions>
</Dialog>


    </ArgonBox>
  );
}

DashCard.propTypes = {
  title: PropTypes.string,
  count: PropTypes.string,
  icon: PropTypes.any,
  percentage:PropTypes.any,
  onRefresh: PropTypes.func.isRequired,
  onHighlight: PropTypes.func.isRequired,
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      SpireTransportType: PropTypes.string,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      speed: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
      zone: PropTypes.string
    })
  ).isRequired,
  setVessels: PropTypes.func.isRequired,
  setFilteredVessels: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
};


export default DashCard;
