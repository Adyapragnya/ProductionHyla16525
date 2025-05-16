import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { CircularProgress, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { AuthContext } from "../../AuthContext";


const ViewUser = () => {
    const { role,id, loginEmail} = useContext(AuthContext); 
  const [users, setUsers] = useState([]); // All user data

  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

 
  // Fetch user data on component mount
  useEffect(() => {

    
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    axios
      .get(`${baseURL}/api/users/getData`, {
        params: { role, id }, 
      })
      .then((response) => {
        setUsers(response.data);

        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, [role, id]);


  // Delete a user with confirmation via SweetAlert
  const handleDeleteUser = (user) => {
    console.log(user);
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    swal({
      title: "Are you sure?",
      content: {
        element: "span",
        attributes: {
          innerHTML: `Do you really want to delete <b>${user.userFirstName} ${user.userLastName}</b> user? This action cannot be undone.`,
        },
      },
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .delete(`${baseURL}/api/users/delete-user` , {
            data: { userEmail: user.userEmail, _id: user._id, deletedBy: loginEmail }, // Send in body
          })
          .then(() => {
                 // Update state by filtering out the deleted user
                 setUsers((prev) => prev.filter((u) => u._id !== user._id));
            swal("User has been deleted!", { icon: "success" });
          })
          .catch((err) => {
            console.error('Error deleting user:', err);
            swal("Failed to delete user", { icon: "error" });
          });
      }
    });
  };

  // Dedicated component for the delete action cell with prop validation
  const DeleteActionCell = ({ row }) => (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleDeleteUser(row.original)}
      style={{color:" #fff"}}
    >
      Delete User
    </Button>
  );

  DeleteActionCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.object.isRequired,
    }).isRequired,
  };

  // Define the actions column using the dedicated DeleteActionCell component
  const actionsColumn = {
    header: 'Actions',
    Cell: DeleteActionCell,
  };

  // Columns for organizational users
  const organizationalColumns = [
    { accessorKey: 'userType', header: 'Category' },
    { accessorKey: 'selectedOrganization', header: 'Organization' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'contactEmail', header: 'Contact Email' },
    { accessorKey: 'userFirstName', header: 'First Name' },
    { accessorKey: 'userLastName', header: 'Last Name' },
    { accessorKey: 'userEmail', header: 'Email' },
    actionsColumn,
  ];

  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: '#0F67B1', marginBottom: '15px' }}>
        View Users
      </h2>

     

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && users.length > 0 ? (
        <MaterialReactTable
          columns={organizationalColumns}
          data={users}
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
                Total Users: {users.length}
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


export default ViewUser;
