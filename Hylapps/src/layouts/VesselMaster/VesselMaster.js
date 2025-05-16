/* eslint-disable react-hooks/exhaustive-deps */
// frontend/src/components/VesselMaster.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MaterialReactTable } from 'material-react-table';
import {
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
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import Fade from '@mui/material/Fade';

// Define all field keys and labels
const fields = [
  { key: 'imoNumber', label: 'imoNumber' },
  { key: 'transportName', label: 'transportName' },
  { key: 'FLAG', label: 'FLAG' },
  { key: 'StatCode5', label: 'StatCode5' },
  { key: 'transportCategory', label: 'transportCategory' },
  { key: 'transportSubCategory', label: 'transportSubCategory' },
  { key: 'SpireTransportType', label: 'SpireTransportType' },
  { key: 'buildYear', label: 'buildYear' },
  { key: 'GrossTonnage', label: 'GrossTonnage' },
  { key: 'deadWeight', label: 'deadWeight' },
  { key: 'LOA', label: 'LOA' },
  { key: 'Beam', label: 'Beam' },
  { key: 'MaxDraft', label: 'MaxDraft' },
  { key: 'ME_kW_used', label: 'ME_kW_used' },
  { key: 'AE_kW_used', label: 'AE_kW_used' },
  { key: 'RPM_ME_used', label: 'RPM_ME_used' },
  { key: 'Enginetype_code', label: 'Enginetype_code' },
  { key: 'subst_nr_ME', label: 'subst_nr_ME' },
  { key: 'Stofnaam_ME', label: 'Stofnaam_ME' },
  { key: 'Fuel_ME_code_sec', label: 'Fuel_ME_code_sec' },
  { key: 'EF_ME', label: 'EF_ME' },
  { key: 'Fuel_code_aux', label: 'Fuel_code_aux' },
  { key: 'EF_AE', label: 'EF_AE' },
  { key: 'EF_gr_prs_ME', label: 'EF_gr_prs_ME' },
  { key: 'EF_gr_prs_AE_SEA', label: 'EF_gr_prs_AE_SEA' },
  { key: 'EF_gr_prs_AE_BERTH', label: 'EF_gr_prs_AE_BERTH' },
  { key: 'EF_gr_prs_BOILER_BERTH', label: 'EF_gr_prs_BOILER_BERTH' },
  { key: 'EF_gr_prs_AE_MAN', label: 'EF_gr_prs_AE_MAN' },
  { key: 'EF_gr_prs_AE_ANCHOR', label: 'EF_gr_prs_AE_ANCHOR' },
  { key: 'NO_OF_ENGINE_active', label: 'NO_OF_ENGINE_active' },
  { key: 'CEF_type', label: 'CEF_type' },
  { key: 'Loadfactor_ds', label: 'Loadfactor_ds' },
  { key: 'Speed_used_', label: 'Speed_used_' },
  { key: 'CRS_min', label: 'CRS_min' },
  { key: 'CRS_max', label: 'CRS_max' },
  { key: 'Funnel_heigth', label: 'Funnel_heigth' },
  { key: 'transportType', label: 'transportType' },
];

// Define field types (as in the DB) to determine input type and conversion
const fieldTypes = {
  imoNumber: "number",
  transportName: "text",
  FLAG: "text",
  StatCode5: "text",
  transportCategory: "text",
  transportSubCategory: "text",
  SpireTransportType: "text",
  buildYear: "number",
  GrossTonnage: "number",
  deadWeight: "number",
  LOA: "number",
  Beam: "number",
  MaxDraft: "number",
  ME_kW_used: "number",
  AE_kW_used: "number",
  RPM_ME_used: "number",
  Enginetype_code: "text",
  subst_nr_ME: "number",
  Stofnaam_ME: "text",
  Fuel_ME_code_sec: "text",
  EF_ME: "number",
  Fuel_code_aux: "text",
  EF_AE: "number",
  EF_gr_prs_ME: "number",
  EF_gr_prs_AE_SEA: "number",
  EF_gr_prs_AE_BERTH: "number",
  EF_gr_prs_BOILER_BERTH: "number",
  EF_gr_prs_AE_MAN: "number",
  EF_gr_prs_AE_ANCHOR: "number",
  NO_OF_ENGINE_active: "number",
  CEF_type: "number",
  Loadfactor_ds: "number",
  Speed_used_: "number",
  CRS_min: "number",
  CRS_max: "number",
  Funnel_heigth: "number",
  transportType: "text",
};

// For the edit wizard, we split fields equally into 2 steps
const stepCount = 2;
const fieldsPerStep = Math.ceil(fields.length / stepCount);
const wizardSteps = Array.from({ length: stepCount }, (_, stepIndex) =>
  fields.slice(stepIndex * fieldsPerStep, (stepIndex + 1) * fieldsPerStep)
);

// ActionsCell renders the Edit button in the table
const ActionsCell = ({ row, handleEdit }) => (
  <button
    onClick={() => handleEdit(row.original)}
    style={{
      padding: '6px 12px',
      backgroundColor: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    }}
  >
    Edit
  </button>
);

ActionsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.object.isRequired,
  }).isRequired,
  handleEdit: PropTypes.func.isRequired,
};

const VesselMaster = () => {
  // Data states
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);

  // Search states
  const [tempSearch, setTempSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  // Edit Wizard modal state
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [originalFormData, setOriginalFormData] = useState({});

  // Add New modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({});

  const theme = useTheme();
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  // Fetch vessels with pagination and search filtering
  const fetchVessels = async (search = '') => {
    try {
  const baseURL = process.env.REACT_APP_API_BASE_URL;

      const response = await axios.get(`${baseURL}/api/vessel-master/getData`, {
        params: { search },
      });
      setVessels(response.data.vessel);
      // console.log(response.data.vessel);
    } catch (err) {
      console.error(err);
      setError('Failed to load vessels');
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchVessels(searchTerm);
    }
  }, [searchTerm]);

  // Search handlers
  const handleSearchInputChange = (e) => {
    setTempSearch(e.target.value);
  };

  const handleSearchButtonClick = () => {
    if (!searchBarOpen) {
      setSearchBarOpen(true);
    } else {
      setSearchTerm(tempSearch);
    }
  };

  // Edit modal handlers
  const handleEdit = (vessel) => {
    setFormData(vessel);
    setOriginalFormData(vessel); // store original data for comparison
    setCurrentStep(0);
    setOpenModal(true);
  };


  const validateStep = () => {
    const currentFields = wizardSteps[currentStep];
    for (let field of currentFields) {
          // Skip validation for transportType
    if (field.key === 'transportType') continue;

      if (!formData[field.key] && formData[field.key] !== 0) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Field "${field.label}" is required.`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          zIndex: 3000,
          target: document.body,
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    // if (!validateStep()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Final submission for updating a vessel record
  const handleSubmit = () => {
    // if (!validateStep()) return;

    // Compute only changed fields and convert to appropriate types
    const changedFields = {};
    for (let key in formData) {
      if (formData[key] !== originalFormData[key]) {
        changedFields[key] =
          fieldTypes[key] === "number" ? parseFloat(formData[key]) : formData[key];
      }
    }
    // console.log('imo', originalFormData.imoNumber);
    // console.log('Changed fields:', changedFields);

    axios
      .put(`${baseURL}/api/updated-vessel-master/${originalFormData.imoNumber}`, changedFields)
      .then(() => {
        setVessels((prev) =>
          prev.map((v) => (v._id === formData._id ? formData : v))
        );
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Vessel information updated successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          zIndex: 2000,
          target: document.body,
        });
        setOpenModal(false);
        setNewFormData({});

      })
      .catch((err) => {
        console.error('Error updating vessel:', err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to update vessel information.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          zIndex: 2000,
          target: document.body,
        });
      });
    setOpenModal(false);
  };

  // Add New modal handlers
  const handleNewInputChange = (key, value) => {
    // console.log(key, value);
    setNewFormData((prev) => ({ ...prev, [key]: value }));
  };

  
  const handleInputChange = (key, value) => {
    // console.log(key, value);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };


  const handleAddSubmit = () => {
    // Prepare new vessel data with correct types.
    // Empty values are converted to null.
    const newVesselData = {};
    for (let key in newFormData) {
      newVesselData[key] =
        newFormData[key] === ''
          ? null
          : fieldTypes[key] === "number"
          ? parseFloat(newFormData[key])
          : newFormData[key];
    }
    // console.log('newFormData',newFormData);
    // console.log('newFormData0000',newVesselData);

  const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios
      .post(`${baseURL}/api/vessel-master/add`, newVesselData)
      .then((response) => {
        setVessels((prev) => [...prev, response.data.vessel]);
        // console.log(response.data);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'New vessel added successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          zIndex: 2000,
          target: document.body,
        });
        setOpenAddModal(false);
        setNewFormData({});
      })
      .catch((err) => {
        console.error('Error adding new vessel:', err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: err.response.data.message || 'Failed to add new vessel.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          zIndex: 2000,
          target: document.body,
        });
      });
  };

  // Custom cell renderer for the Edit action
  const EditCellRenderer = ({ row }) => (
    <ActionsCell row={row} handleEdit={handleEdit} />
  );

  EditCellRenderer.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.object.isRequired,
    }).isRequired,
  };

  // Define table columns (including the edit action)
  const columns = [
    {
      header: 'Actions',
      size: 150,
      Cell: EditCellRenderer,
    },
    { accessorKey: 'imoNumber', header: 'imoNumber', size: 120 },
    { accessorKey: 'transportName', header: 'transportName', size: 150 },
    { accessorKey: 'FLAG', header: 'FLAG', size: 100 },
    { accessorKey: 'StatCode5', header: 'StatCode5', size: 100 },
    { accessorKey: 'transportCategory', header: 'transportCategory', size: 150 },
    { accessorKey: 'transportSubCategory', header: 'transportSubCategory', size: 150 },
    { accessorKey: 'SpireTransportType', header: 'SpireTransportType', size: 150 },
    { accessorKey: 'buildYear', header: 'buildYear', size: 100 },
    { accessorKey: 'GrossTonnage', header: 'GrossTonnage', size: 150 },
    { accessorKey: 'deadWeight', header: 'deadWeight', size: 150 },
    { accessorKey: 'LOA', header: 'LOA', size: 100 },
    { accessorKey: 'Beam', header: 'Beam', size: 100 },
    { accessorKey: 'MaxDraft', header: 'MaxDraft', size: 100 },
    { accessorKey: 'ME_kW_used', header: 'ME_kW_used', size: 130 },
    { accessorKey: 'AE_kW_used', header: 'AE_kW_used', size: 130 },
    { accessorKey: 'RPM_ME_used', header: 'RPM_ME_used', size: 130 },
    { accessorKey: 'Enginetype_code', header: 'Enginetype_code', size: 150 },
    { accessorKey: 'subst_nr_ME', header: 'subst_nr_ME', size: 150 },
    { accessorKey: 'Stofnaam_ME', header: 'Stofnaam_ME', size: 150 },
    { accessorKey: 'Fuel_ME_code_sec', header: 'Fuel_ME_code_sec', size: 150 },
    { accessorKey: 'EF_ME', header: 'EF_ME', size: 100 },
    { accessorKey: 'Fuel_code_aux', header: 'Fuel_code_aux', size: 150 },
    { accessorKey: 'EF_AE', header: 'EF_AE', size: 100 },
    { accessorKey: 'EF_gr_prs_ME', header: 'EF_gr_prs_ME', size: 150 },
    { accessorKey: 'EF_gr_prs_AE_SEA', header: 'EF_gr_prs_AE_SEA', size: 150 },
    { accessorKey: 'EF_gr_prs_AE_BERTH', header: 'EF_gr_prs_AE_BERTH', size: 150 },
    { accessorKey: 'EF_gr_prs_BOILER_BERTH', header: 'EF_gr_prs_BOILER_BERTH', size: 150 },
    { accessorKey: 'EF_gr_prs_AE_MAN', header: 'EF_gr_prs_AE_MAN', size: 150 },
    { accessorKey: 'EF_gr_prs_AE_ANCHOR', header: 'EF_gr_prs_AE_ANCHOR', size: 150 },
    { accessorKey: 'NO_OF_ENGINE_active', header: 'NO_OF_ENGINE_active', size: 150 },
    { accessorKey: 'CEF_type', header: 'CEF_type', size: 100 },
    { accessorKey: 'Loadfactor_ds', header: 'Loadfactor_ds', size: 150 },
    { accessorKey: 'Speed_used_', header: 'Speed_used_', size: 130 },
    { accessorKey: 'CRS_min', header: 'CRS_min', size: 100 },
    { accessorKey: 'CRS_max', header: 'CRS_max', size: 100 },
    { accessorKey: 'Funnel_heigth', header: 'Funnel_heigth', size: 150 },
    { accessorKey: 'transportType', header: 'transportType', size: 150 },
  ];

    
  return (
    <Box sx={{ p: 2 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }} >
        <Fade in={searchBarOpen} timeout={500}>
          <Box
            sx={{
              mr: 1,
              transition: 'transform 0.5s ease, opacity 0.5s ease',
              transform: searchBarOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: searchBarOpen ? 1 : 0,
            }}
          >
            <TextField
              placeholder="Search..."
              value={tempSearch}
              onChange={handleSearchInputChange}
              variant="outlined"
              fullWidth
            />
          </Box>
        </Fade>
        <Button variant="contained" color="light" onClick={handleSearchButtonClick}>
         <i className='fa-solid fa-search'></i>&nbsp; Search
        </Button>
        <Button
          variant="contained"
          color="light"
          onClick={() => setOpenAddModal(true)}
          sx={{ ml: 1 }}
        >
          <i className='fa-solid fa-plus-circle'></i>&nbsp;
          Add New
        </Button>
      </Box>

      {error && <Typography variant="h6" color="error">{error}</Typography>}

      {/* Vessel Table */}
      <MaterialReactTable
        columns={columns}
        data={vessels}
        enableColumnResizing
        enableGrouping
        enablePagination
        enableColumnPinning
        enableExport
        enableDensityToggle
        initialState={{
          pagination: { pageIndex: 0, pageSize: 100 },
          sorting: [{ desc: false }],
          density: 'compact',
        }}
        muiTableHeadCellProps={{
          style: { fontWeight: 'bold', padding: '8px', textAlign: 'center', color: '#0F67B1' },
        }}
        muiTableBodyRowProps={{
          style: { padding: '15px', textAlign: 'center' },
        }}
      />

      {/* Edit Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          style: {
            borderRadius: 20,
            padding: '0',
            background: 'linear-gradient(135deg, #ece9e6, #ffffff)',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle
          style={{
            fontWeight: 'bold',
            fontSize: '1.5rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '16px 24px',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          Vessel Master Edit
        </DialogTitle>
        <DialogContent
          dividers
          style={{
            backgroundColor: '#f5f5f5',
            padding: '24px',
          }}
        >
          <Stepper activeStep={currentStep} alternativeLabel>
            {wizardSteps.map((_, index) => (
              <Step key={index}>
                <StepLabel>Step {index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {wizardSteps[currentStep].map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                <Typography align="left" variant="body1" sx={{ mb: 1 }}>
                  {field.label}
                </Typography>
                <TextField
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  type={fieldTypes[field.key] === "number" ? "number" : "text"}
                  style={{ backgroundColor: '#fff', borderRadius: '4px' }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions
          style={{
            padding: '16px 24px',
            backgroundColor: '#f5f5f5',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          {currentStep > 0 && (
            <Button onClick={handleBack} style={{ backgroundColor: '#ffa726', color: '#fff' }}>
              Back
            </Button>
          )}
          {currentStep < wizardSteps.length - 1 ? (
            <Button onClick={handleNext} variant="contained" style={{ backgroundColor: '#2b659e' }}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} variant="contained" style={{ backgroundColor: '#388e3c' }}>
              Update
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add New Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          style: {
            borderRadius: 20,
            padding: '0',
            background: 'linear-gradient(135deg, #ece9e6, #ffffff)',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle
          style={{
            fontWeight: 'bold',
            fontSize: '1.5rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '16px 24px',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          Add New Vessel
        </DialogTitle>
        <DialogContent
          dividers
          style={{
            backgroundColor: '#f5f5f5',
            padding: '24px',
          }}
        >
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                <Typography align="left" variant="body1" sx={{ mb: 1 }}>
                  {field.label}
                </Typography>
                <TextField
                  value={newFormData[field.key] || ''}
                  onChange={(e) => handleNewInputChange(field.key, e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  type={fieldTypes[field.key] === "number" ? "number" : "text"}
                  style={{ backgroundColor: '#fff', borderRadius: '4px' }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions
          style={{
            padding: '16px 24px',
            backgroundColor: '#f5f5f5',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={() => setOpenAddModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} variant="contained" style={{ backgroundColor: '#388e3c' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

VesselMaster.propTypes = {
  baseURL: PropTypes.string,
};

export default VesselMaster;
