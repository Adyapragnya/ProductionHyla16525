import React, { useState, useEffect,useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MaterialReactTable } from 'material-react-table';
import { AuthContext } from "../../AuthContext";


// Custom cell component for rendering files with prop validations
const FilesCell = ({ cell }) => {
  const files = cell.getValue();
  return files && files.length > 0 ? (
    <ul style={{ margin: 0, paddingLeft: '20px' }}>
      {files.map((file, index) => (
        <li key={index}>
          <a 
            href={`http://localhost:5000/${file}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {file.split('/').pop()}
          </a>
        </li>
      ))}
    </ul>
  ) : 'No files uploaded';
};

FilesCell.propTypes = {
  cell: PropTypes.shape({
    getValue: PropTypes.func.isRequired,
  }).isRequired,
};

// New ActionsCell component for handling delete action with prop validations
const ActionsCell = ({ row, handleDelete }) => {
  return (
    <button
      onClick={() => handleDelete(row.original)}
      style={{
        padding: '6px 12px',
        backgroundColor: '#d32f2f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
      }}
    >
      Delete Org
    </button>
  );
};

ActionsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.object.isRequired,
  }).isRequired,
  handleDelete: PropTypes.func.isRequired,
};

const ViewOrganization = ({ baseURL }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role,id, loginEmail} = useContext(AuthContext); 
  // Use provided baseURL prop or fallback to environment variable
  const apiBaseURL =  process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    console.log(loginEmail);
  },[loginEmail]);

  useEffect(() => {
    axios.get(`${apiBaseURL}/api/organizations/getData`)
      .then((response) => {
        setOrganizations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations');
        setLoading(false);
      });
  }, [apiBaseURL]);

  // Function to handle deletion of an organization
  const handleDelete = (org) => {
    console.log(org);
    // First confirmation step
    Swal.fire({
      title: 'Are you sure?',
      html: `Do you really want to delete organization <strong>${org.companyName}</strong> and associated users?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((firstResult) => {
      if (firstResult.isConfirmed) {
        // Second confirmation step
        Swal.fire({
          title: 'Confirm Deletion',
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            // Perform delete operation
            axios.delete(`${apiBaseURL}/api/organizations/delete/${org.orgId}`,{
              data: {deletedBy: loginEmail}
            })
              .then((response) => {
                console.log('Delete Response:', response.data);
                // Remove deleted organization from state
                setOrganizations(prevOrgs =>
                  prevOrgs.filter(item => item._id !== org._id)
                );
                Swal.fire('Deleted!', 'The organization has been deleted.', 'success');
              })
              .catch((err) => {
                console.error('Error deleting organization:', err);
                Swal.fire('Error!', 'Failed to delete organization.', 'error');
              });
          }
        });
      }
    });
  };

  // Create a separate cell renderer for delete action with its own prop validations.
  const DeleteCellRenderer = ({ row }) => (
    <ActionsCell row={row} handleDelete={handleDelete} />
  );

  DeleteCellRenderer.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.object.isRequired,
    }).isRequired,
  };

  // Define columns with explicit sizes and the new Actions column
  const columns = [
    { accessorKey: 'companyTitle', header: 'Company Title', size: 150 },
    { accessorKey: 'companyName', header: 'Company Name', size: 150 },
    { accessorKey: 'address', header: 'Address', size: 200 },
    { accessorKey: 'contactEmail', header: 'Contact Email', size: 200 },
    { accessorKey: 'assignShips', header: 'Assigned Ships', size: 150 },
    { accessorKey: 'adminFirstName', header: 'Admin First Name', size: 150 },
    { accessorKey: 'adminLastName', header: 'Admin Last Name', size: 150 },
    { accessorKey: 'adminEmail', header: 'Admin Email', size: 200 },
    { accessorKey: 'adminContactNumber', header: 'Admin Contact', size: 150 },
    { accessorKey: 'files', header: 'Files', size: 200, Cell: FilesCell },
    {
      header: 'Actions',
      size: 150,
      Cell: DeleteCellRenderer,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: "#0F67B1", marginBottom: "15px", textAlign: 'center' }}>
        View Organizations
      </h2>

      {loading ? (
        <p>Loading organizations...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : organizations.length > 0 ? (
        <MaterialReactTable
          columns={columns}
          data={organizations}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ desc: false }],
            density: 'compact',
          }}
          enableColumnResizing
          enableColumnOrdering
          enableSorting
          enableGlobalFilter
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnDragging
          enableExport
          enableDensityToggle
          muiTableHeadCellProps={{ align: 'left' }}
          muiTableBodyCellProps={{ align: 'left' }}
          muiTableContainerProps={{
            sx: {
              tableLayout: 'auto', // helps the table recalculate widths for proper alignment on all devices
            },
          }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [10, 20, 50],
          }}
        />
      ) : (
        <p>No organizations found.</p>
      )}
    </div>
  );
};

ViewOrganization.propTypes = {
  baseURL: PropTypes.string,
};

export default ViewOrganization;
