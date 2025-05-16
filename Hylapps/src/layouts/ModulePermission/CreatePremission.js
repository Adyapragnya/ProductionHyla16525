import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import { CircularProgress, Box, Typography } from '@mui/material';
import './Module.css';

// Define constants for environment variables for cleaner code.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const CreatePermission = () => {
  // Organization and User state
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [orgId, setOrgId] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isSubmittingLoader, setIsSubmittingLoader] = useState(false);

  // Module Permissions state with expandable submodules
  const [modulePermissions, setModulePermissions] = useState([
    {
      moduleName: 'Ship Dashboard',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Sales Dashboard',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'JIT Optimizer',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Ops Radar',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Alerts & Notifications',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Analytics Hyla',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Geofemce Management',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Fleet Manager',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Create Users',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
    {
      moduleName: 'Sat Nav Edit',
      read: false,
      write: false,
      edit: false,
      all: false,
      subModules: [
        { moduleName: 'Sub Module', read: false, write: false, edit: false, all: false },
      ],
    },
  ]);
  const [expandedRows, setExpandedRows] = useState([]);

  // Fetch the list of organizations on component mount.
  useEffect(() => {
    const fetchOrganizationNames = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/organizations`);
        if (!response.ok) {
          throw new Error('Failed to fetch organization names');
        }
        const data = await response.json();
        setOrganizationNames(data);
      } catch (error) {
        console.error('Error fetching organization names:', error);
        Swal.fire('Error', 'Failed to load organization names.', 'error');
      }
    };
    fetchOrganizationNames();
  }, []);

  // Fetch organization details when a selection is made.
  const handleOrganizationChange = async (e) => {
    const organizationName = e.target.value;
    setSelectedOrganization(organizationName);

    if (organizationName) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch organization details');
        }
        const organizationData = await response.json();
        setOrgId(organizationData.orgId);
        setAddress(organizationData.address);
        setContactEmail(organizationData.contactEmail);
      } catch (error) {
        console.error('Error fetching organization data:', error);
        Swal.fire('Error', 'Failed to load organization details.', 'error');
      }
    } else {
      setOrgId('');
      setAddress('');
      setContactEmail('');
    }
  };

  // Encrypt sensitive data before sending to the backend.
  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  };

  // Toggle module and submodule permissions.
  const handlePermissionChange = (index, permission, isSubModule = false, subIndex = null) => {
    setModulePermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions];
      if (isSubModule && subIndex !== null) {
        updatedPermissions[index].subModules[subIndex][permission] =
          !updatedPermissions[index].subModules[subIndex][permission];
      } else {
        if (permission === 'all') {
          const isChecked = !updatedPermissions[index].all;
          ['read', 'write', 'edit', 'all'].forEach((perm) => {
            updatedPermissions[index][perm] = isChecked;
          });
        } else {
          updatedPermissions[index][permission] = !updatedPermissions[index][permission];
        }
      }
      return updatedPermissions;
    });
  };

  // Toggle the expansion state for modules to show/hide submodules.
  const toggleRowExpansion = (index) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(index)
        ? prevExpandedRows.filter((rowIndex) => rowIndex !== index)
        : [...prevExpandedRows, index]
    );
  };

  // Basic email validation using regex.
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  // Reset all form fields to their initial state.
  const resetForm = () => {
    setSelectedOrganization('');
    setOrgId('');
    setAddress('');
    setContactEmail('');
    setUserFirstName('');
    setUserLastName('');
    setUserEmail('');
    setUserRole('');
    setUserType('');
    // Optionally, reset modulePermissions if needed.
  };

  // Handle form submission with validations and confirmation.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields.
    const validations = [
      { condition: !userType, message: 'Please select a User Category.' },
      {
        condition: userType === 'organizational user' && !selectedOrganization,
        message: 'Please select an Organization Name.',
      },
      { condition: !userFirstName, message: 'Please enter the User First Name.' },
      { condition: !userLastName, message: 'Please enter the User Last Name.' },
      {
        condition: !userEmail || !validateEmail(userEmail),
        message: 'Please enter a valid User Email.',
      },
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        Swal.fire('Error', message, 'error');
        return;
      }
    }

    // Confirm the action with the user.
    const result = await Swal.fire({
      title: 'Confirm User Permissions',
      text: 'Do you want to save this user permission?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      setIsSubmittingLoader(true);

      // Prepare user data with encryption for sensitive fields.
      const userData = {
        orgId: userType === 'organizational user' ? orgId : null,
        selectedOrganization: userType === 'organizational user' ? selectedOrganization : null,
        address: userType === 'organizational user' ? address : null,
        contactEmail: userType === 'organizational user' ? encryptData(contactEmail) : null,
        userFirstName,
        userLastName,
        userEmail: encryptData(userEmail),
        userType,
        modulePermissions, // Include permission settings if needed.
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          Swal.fire('Saved!', 'The user permission has been saved.', 'success');
          resetForm();
        } else {
          const errorData = await response.json();
          const errorMessage = errorData?.message || 'Failed to save user permission.';
          throw new Error(errorMessage);
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setIsSubmittingLoader(false);
      }
    }
  };

  // Handle cancellation with confirmation.
  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, go back!',
    });

    if (result.isConfirmed) {
      resetForm();
      Swal.fire('Cancelled!', 'Your action has been cancelled.', 'info');
    }
  };

  return (
    <div className="alert-form-container">
      {/* Full-page loading spinner overlay */}
      {isSubmittingLoader && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255, 255, 255, 0.5)"
          display="flex"
          flexDirection="column-reverse"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Typography variant="h6" align="center" gutterBottom mt={2} aria-live="polite">
            Please wait! Creating Permission...
          </Typography>
          <CircularProgress color="primary" size={60} />
        </Box>
      )}

      <form className="alert-form" onSubmit={handleSubmit}>
        <h2 style={{color:' #0f67b1'}}>Create Permission</h2>
        <hr />

        {/* Category and Organization Selection */}
        <div className="category-container">
          <label htmlFor="userType">
            Category
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="organizational user">Organizational User</option>
              <option value="guest">Guest</option>
            </select>
          </label>

          {userType === 'organizational user' && (
            <div className="two-column">
              <label htmlFor="selectedOrganization">
                Organization Name:
                <select
                  id="selectedOrganization"
                  value={selectedOrganization}
                  onChange={handleOrganizationChange}
                >
                  <option value="" disabled>
                    Select Organization
                  </option>
                  {organizationNames.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <hr />

        {/* User Details Section */}
        <h3>User Details</h3>
        <div className="two-column">
          <label htmlFor="userFirstName">
            First Name:
            <input
              id="userFirstName"
              type="text"
              value={userFirstName}
              onChange={(e) => setUserFirstName(e.target.value)}
              placeholder="Enter first name"
            />
          </label>
          <label htmlFor="userLastName">
            Last Name:
            <input
              id="userLastName"
              type="text"
              value={userLastName}
              onChange={(e) => setUserLastName(e.target.value)}
              placeholder="Enter last name"
            />
          </label>
        </div>
        <div className="two-column">
          <label htmlFor="userEmail">
            Email:
            <input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value.toLowerCase())}
              placeholder="Enter user email"
            />
          </label>
          <label htmlFor="userRole">
            Role:
            <input
              id="userRole"
              type="text"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value.toLowerCase())}
              placeholder="Enter user role"
              required
            />
          </label>
        </div>

        {/* Module Permissions Table */}
        <h3>Module Permission</h3>
        <div className="permissions-table-container">
          <table className="permissions-table" style={{ cursor: 'pointer' }}>
            <thead>
              <tr>
                <th>Module Name</th>
                <th>Read</th>
                <th>Write</th>
                <th>Edit</th>
                <th>All</th>
              </tr>
            </thead>
            <tbody>
              {modulePermissions.map((module, index) => (
                <React.Fragment key={module.moduleName}>
                  <tr>
                    <td
                      className="module-name"
                      onClick={() => toggleRowExpansion(index)}
                    >
                      {module.moduleName} {expandedRows.includes(index) ? '🔼' : '🔽'}
                    </td>
                    {['read', 'write', 'edit', 'all'].map((permission) => (
                      <td key={permission}>
                        <input
                          type="checkbox"
                          checked={module[permission]}
                          onChange={() => handlePermissionChange(index, permission)}
                        />
                      </td>
                    ))}
                  </tr>
                  {expandedRows.includes(index) &&
                    module.subModules.map((subModule, subIndex) => (
                      <tr key={subModule.moduleName} className="sub-module-row">
                        <td className="sub-module-name">{subModule.moduleName}</td>
                        {['read', 'write', 'edit', 'all'].map((permission) => (
                          <td key={permission}>
                            <input
                              type="checkbox"
                              checked={subModule[permission]}
                              onChange={() =>
                                handlePermissionChange(index, permission, true, subIndex)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button type="submit" disabled={isSubmittingLoader}>
            {isSubmittingLoader ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePermission;
