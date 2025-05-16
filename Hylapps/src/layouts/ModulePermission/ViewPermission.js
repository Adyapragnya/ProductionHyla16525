import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { CircularProgress, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ActionCell Component
 *
 * This component renders the "Edit Permissions" button for a given row.
 */
const ActionCell = ({ row, editPermissions }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => editPermissions(row.original)}
  >
    <i className='fa-solid fa-pencil' style={{color:" #fff"}}></i>
  </Button>
);

ActionCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.object.isRequired,
  }).isRequired,
  editPermissions: PropTypes.func.isRequired,
};

/**
 * ActionCellRenderer Component
 *
 * This wrapper component is used to pass the necessary props with proper validation
 * to the ActionCell component. This helps avoid inline prop validation warnings.
 */
const ActionCellRenderer = ({ row, editPermissions }) => {
  return <ActionCell row={row} editPermissions={editPermissions} />;
};

ActionCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.object.isRequired,
  }).isRequired,
  editPermissions: PropTypes.func.isRequired,
};

/**
 * ViewUser Component
 *
 * This component fetches a list of users from an API endpoint and renders them in a configurable
 * MaterialReactTable. It also provides a dropdown to filter users by their type.
 */
const ViewUser = () => {
  // Local state for full user data, filtered subset, loading and error indicators, and filter selection.
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/users/getData`);
        // Save full data and initial filtered view
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Update filtered user list based on dropdown selection.
  const handleUserTypeChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedUserType(value);
    setFilteredUsers(
      value === '' ? users : users.filter((user) => user.userType === value)
    );
  }, [users]);

  // Define column configurations for organizational and guest users.
  const organizationalColumns = useMemo(() => ([
    { accessorKey: 'userType', header: 'Category' },
    { accessorKey: 'selectedOrganization', header: 'Organization' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'contactEmail', header: 'Contact Email' },
    { accessorKey: 'userFirstName', header: 'First Name' },
    { accessorKey: 'userLastName', header: 'Last Name' },
    { accessorKey: 'userEmail', header: 'Email' },
    // { accessorKey: 'userContactNumber', header: 'Contact Number' },
  ]), []);

  const guestColumns = useMemo(() => ([
    { accessorKey: 'userType', header: 'Category' },
    { accessorKey: 'userFirstName', header: 'First Name' },
    { accessorKey: 'userLastName', header: 'Last Name' },
    { accessorKey: 'userEmail', header: 'Email' },
    // { accessorKey: 'userContactNumber', header: 'Contact Number' },
  ]), []);

  // Callback to handle the "Edit Permissions" action
  const editPermissions = useCallback((user) => {
    // Replace with your actual edit permission logic
    console.log("Edit permissions for user:", user);
  }, []);

  // Dynamically select the appropriate column configuration and append the actions column.
  const columns = useMemo(() => {
    const baseColumns = selectedUserType === 'guest' ? guestColumns : organizationalColumns;
    return [
      ...baseColumns,
      {
        id: 'actions',
        header: 'Actions',
        // Instead of an inline function, we delegate to a separate component with propTypes.
        Cell: (props) => (
          <ActionCellRenderer {...props} editPermissions={editPermissions} />
        ),
      }
    ];
  }, [selectedUserType, guestColumns, organizationalColumns, editPermissions]);

  return (
    <div className="alert-form-container" style={{ padding: '1rem' }}>
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>
        View Users
      </h2>

      {/* Filter Dropdown */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="userType" style={{ marginRight: '10px' }}>
          Filter by User Type:
        </label>
        <select
          id="userType"
          value={selectedUserType}
          onChange={handleUserTypeChange}
          style={{
            padding: '5px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          <option value="">All</option>
          <option value="organizational user">Organizational User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Loading & Error Handling */}
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Render Table if data is available; otherwise, show a fallback message */}
      {!loading && filteredUsers.length > 0 ? (
        <MaterialReactTable
          columns={columns}
          data={filteredUsers}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ desc: false }],
            density: 'compact',
          }}
          enableColumnFilter={false}
          enableFullScreenToggle={false}
          enableColumnSorting
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnOrdering
          enableColumnDragging
          enableExport
          enableDensityToggle
          muiTableBodyRowProps={{ hover: true }}
          muiTableProps={{
            sx: {
              minHeight: 500,
              borderCollapse: 'collapse',
            },
          }}
          renderTopToolbarCustomActions={() => (
            <div>
              <Typography variant="h6" color="primary">
                Total Users: {filteredUsers.length}
              </Typography>
            </div>
          )}
        />
      ) : (
        !loading && <Typography>No users found.</Typography>
      )}
    </div>
  );
};

ViewUser.propTypes = {
  // Although the component uses internal state for users,
  // if you choose to pass data in the future you can add:
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userType: PropTypes.string.isRequired,
      selectedOrganization: PropTypes.string,
      address: PropTypes.string,
      contactEmail: PropTypes.string,
      userFirstName: PropTypes.string.isRequired,
      userLastName: PropTypes.string.isRequired,
      userEmail: PropTypes.string.isRequired,
      userContactNumber: PropTypes.string.isRequired,
    })
  ),
  selectedUserType: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  filteredUsers: PropTypes.array,
  handleUserTypeChange: PropTypes.func,
};

ViewUser.defaultProps = {
  users: [],
  selectedUserType: '',
  loading: true,
  error: null,
  filteredUsers: [],
  handleUserTypeChange: () => {},
};

export default ViewUser;
