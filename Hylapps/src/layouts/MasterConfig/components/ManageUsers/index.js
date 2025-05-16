import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ActionMenu from './components/ActionMenu';
import CreateOrganizationModal from './components/CreateOrganizationModal';
import EditOrganizationModal from './components/EditOrganizationModal';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Chart } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tooltip } from 'react-tooltip';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import { AuthContext } from "../../../../AuthContext";
import './Module.css';

const UserManagement = () => {
  const { role,id,loginEmail} = useContext(AuthContext); 
  const [organizations, setOrganizations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedRole, setSelectedRole] = useState('organization');
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guestVesselLimit, setGuestVesselLimit] = useState(null);

  
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrgToEdit, setSelectedOrgToEdit] = useState(null);  // To store selected organization

  const baseURL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    fetchData();
  }, [baseURL]);

  useEffect(() => {
  console.log(loginEmail);
  }, [loginEmail]);

    // Build a flat, indented array of rows for org → admin → users
const transformOrgsToRows = () => {
  const rows = [];
  organizations.forEach(org => {
    rows.push({
      Title: org.companyTitle,
      Name: org.companyName,
      'Admin Email': org.organizationAdmin?.userEmail || '',
      Address: org.address,
      'Vessel Limit': org.vesselLimit,
      Users: org.organizationalUsers?.length || 0,
      Status: org.active ? 'Active' : 'Inactive'
    });
    if (org.organizationAdmin) {
      rows.push({
        Title: `  ⮡  Admin: ${org.organizationAdmin.userFirstName} ${org.organizationAdmin.userLastName}`,
        Name: org.organizationAdmin.userEmail,
        'Admin Email': '',
        Address: '',
        'Vessel Limit': '',
        Users: '',
        Status: org.organizationAdmin.active ? 'Active' : 'Inactive'
      });
    }
    org.organizationalUsers?.forEach(user => {
      rows.push({
        Title: `  ⮡  User: ${user.userFirstName} ${user.userLastName}`,
        Name: user.userEmail,
        'Admin Email': '',
        Address: '',
        'Vessel Limit': '',
        Users: '',
        Status: user.active ? 'Active' : 'Inactive'
      });
    });
  });
  return rows;
};

// Excel export
const handleExportExcel = async () => {
  // 1️⃣ Build rows & summary
  let detailRows, summaryLabels, summaryValues;
  if (selectedRole === 'organization') {
    detailRows = transformOrgsToRows();
    const totalOrgs = organizations.length;
    const allUsers = organizations
      .flatMap(o => [o.organizationAdmin, ...(o.organizationalUsers||[])])
      .filter(Boolean);
    const activeUsers = allUsers.filter(u => u.active).length;
    const inactiveUsers = allUsers.length - activeUsers;
    const totalVessels = organizations.reduce((sum,o) => sum + (o.vesselLimit||0), 0);

    summaryLabels = [
      'Organizations',
      'Active Users',
      'Inactive Users',
      'Total Allorted Vessels'
    ];
    summaryValues = [
      totalOrgs,
      activeUsers,
      inactiveUsers,
      totalVessels
    ];
  } else {
    detailRows = guests.map(g => ({
      Name: `${g.userFirstName} ${g.userLastName}`,
      Email: g.userEmail,
      'Vessel Limit': g.vesselLimit,
      Status: g.active ? 'Active' : 'Inactive'
    }));
    const totalGuests   = guests.length;
    const activeGuests  = guests.filter(g=>g.active).length;
    const inactiveGuests= totalGuests - activeGuests;
    const totalGuestVessels= guests.reduce((sum,g) => sum + (g.vesselLimit||0), 0);

    summaryLabels = [
      'Total Guests',
      'Active Guests',
      'Inactive Guests',
      'Total Allorted Vessels'];
    summaryValues = [totalGuests, activeGuests, inactiveGuests,totalGuestVessels];
  }

  // 2️⃣ Create workbook + a single Details sheet
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('Hyla_Analytical_Report');

  // — Write header & data
  sheet.columns = Object.keys(detailRows[0]).map(key => ({
    header: key, key, width: 20
  }));
  detailRows.forEach(r => sheet.addRow(r));

  // 3️⃣ Determine where to start the summary (2 columns gap after "Status")
  // Find the index of the Status column (1-based)
  const statusColIdx = sheet.columns.findIndex(c => c.header === 'Status') + 1;
  const summaryStartCol = statusColIdx + 2; // leaves two blank columns

  // 4️⃣ Write the summary table next to the data
  const titleCell = sheet.getCell(1, summaryStartCol);
  titleCell.value = 'Summary';
  titleCell.font = { bold: true, size: 14 };

  // Write headers "Category" / "Count"
  sheet.getCell(2, summaryStartCol).value = 'Category';
  sheet.getCell(2, summaryStartCol + 1).value = 'Count';
  sheet.getCell(2, summaryStartCol    ).font = { bold: true };
  sheet.getCell(2, summaryStartCol + 1).font = { bold: true };

  // Write each summary row
  summaryLabels.forEach((lbl, i) => {
    sheet.getCell(3 + i, summaryStartCol    ).value = lbl;
    sheet.getCell(3 + i, summaryStartCol + 1).value = summaryValues[i];
  });

  // 5️⃣ Draw the chart off-screen with custom colors
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: summaryLabels,
      datasets: [{
        data: summaryValues,
        backgroundColor: [
          '#FF165D', '#36A2EB', '#E38B29', '#144272', '#9966FF', '#FF9F40'
        ].slice(0, summaryValues.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      animation: false,
      plugins: { legend: { position: 'right' } }
    }
  });

  // 6️⃣ Embed the chart image into the same sheet
  const imageData = canvas.toDataURL('image/png');
  const imageId   = wb.addImage({ base64: imageData, extension: 'png' });
  sheet.addImage(imageId, {
    tl: { col: summaryStartCol - 1, row: summaryLabels.length + 3 }, // position below summary table
    ext: { width: 400, height: 300 }
  });

  // 7️⃣ Export
  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/octet-stream' }),
    `Hyla_${selectedRole==='organization'?'Organizations':'Guests'}_Report.xlsx`
  );
};

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${baseURL}/api/settings/users-management/all-user-roles`),
      axios.get(`${baseURL}/api/settings/users-management/guest-vessel-limit`)
    ])
      .then(([userData, limitData]) => {
        setOrganizations(userData.data.organizations);
        setGuests(userData.data.guests);
        setGuestVesselLimit(limitData.data.vesselLimit);
      })
      .catch(() => Swal.fire('Error', 'Could not load data', 'error'))
      .finally(() => setLoading(false));
  };

  const toggleOrg = (orgId) =>
    setExpandedOrg(expandedOrg === orgId ? null : orgId);

  const handleToggleOrgStatus = async (org) => {
    const action = org.active ? 'deactivate' : 'activate';
    const { isConfirmed } = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} organization?`,
      text: `This will also ${action} all associated users and admin.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });
    if (isConfirmed) {
      try {
        await axios.put(
          `${baseURL}/api/settings/users-management/org-status/${org.orgId}`,
          { active: !org.active }
        );
        fetchData();
      } catch {
        Swal.fire('Error', 'Could not update organization status', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (userId, active, isAdmin, orgId) => {
    console.log(active);
    const action = active ? 'deactivate' : 'activate';
    const { isConfirmed } = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${
        isAdmin ? 'admin' : 'user'
      }?`,
      text: isAdmin ? `This will ${action} the user.` : '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });
    if (isConfirmed) {
      try {
        await axios.put(
          `${baseURL}/api/settings/users-management/user-status/${userId}`,
          {
            active: !active,
            // orgId
          }
        );
        fetchData();
      } catch {
        Swal.fire('Error', 'Could not update user status', 'error');
      }
    }
  };

  const updateGuestVesselLimit = async () => {
    const { value: newLimit } = await Swal.fire({
      title: 'Update Guest Vessel Limit',
      input: 'number',
      inputLabel: 'Vessel Limit',
      inputValue: guestVesselLimit,
      showCancelButton: true,
      confirmButtonText: 'Update',
      inputAttributes: { min: 0 },
    });
  
    if (newLimit !== undefined) {
      try {
        await axios.put(`${baseURL}/api/settings/users-management/update-guest-vessel-limit`, {
          value: Number(newLimit)
        });
        setGuestVesselLimit(Number(newLimit));
        Swal.fire('Updated!', 'Guest vessel limit has been updated.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to update guest vessel limit.', 'error');
      }
    }
  };

  const handleEditOrg = (org) => {
    setSelectedOrgToEdit(org);
    setIsEditOrgModalOpen(true);
  };

  
  const handleDeleteOrg = (org) => {
    Swal.fire({
      title: 'Delete organization?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) { 
      axios
      .delete(`${baseURL}/api/settings/users-management/delete-org/${org._id}`, {
        data: { deletedBy: loginEmail }, // Send loginEmail as deletedBy
      })
      .then((response) => {
        Swal.fire('Deleted!', 'The organization has been deleted.', 'success');
        fetchData();
        // Optionally, update the UI to reflect the deletion
      })
      .catch((error) => {
        console.error('Error deleting organization:', error);
        Swal.fire('Error!', 'Failed to delete the organization.', 'error');
      });

      }
    });
  };

  const handleEditUser = (user, isAdmin) => {
    setSelectedUser({ ...user, isAdmin });  // attach isAdmin manually
    setIsEditUserModalOpen(true);
  };

  const handleDeleteUser = (user, isAdmin) => {
    Swal.fire({
      title: `Delete ${isAdmin ? 'admin' : 'user'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
       console.log(user);
       console.log(loginEmail);

        axios
        .delete(`${baseURL}/api/settings/users-management/delete-user`, {
          data: { userEmail: user.userEmail, deletedBy: loginEmail }, // Send user email and deletedBy
        })
        .then((response) => {
          Swal.fire('Deleted!', `${isAdmin ? 'Admin' : 'User'} has been deleted.`, 'success');
          fetchData();
          // Optionally, update the UI to reflect the deletion
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
          Swal.fire('Error!', 'Failed to delete the user.', 'error');
        });

      }
    });
  };

  return (
    <div className="user-management-container">
      <CreateOrganizationModal
  isOpen={isOrgModalOpen}
  onRequestClose={() => setIsOrgModalOpen(false)}
  onSuccess={fetchData}
/>

<CreateUserModal
  isOpen={isUserModalOpen}
  onRequestClose={() => setIsUserModalOpen(false)}
  onSuccess={fetchData}
/>

<EditOrganizationModal
  isOpen={isEditOrgModalOpen}
  onRequestClose={() => setIsEditOrgModalOpen(false)}
  orgData={selectedOrgToEdit}
  onSuccess={fetchData}
/>

     <EditUserModal  // Add the EditUserModal here
        isOpen={isEditUserModalOpen}
        onRequestClose={() => setIsEditUserModalOpen(false)}
        selectedUser={selectedUser}
        isAdmin={selectedUser?.isAdmin}
        onSuccess={fetchData}
      />

      <div className="content">
      
    {/* Header Toolbar */}
<div className="header-toolbar flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
  <div className="toolbar-left">
    <h2 className="text-xl font-semibold">User Management</h2>
  </div>

  <div className="toolbar-right flex flex-wrap gap-2 items-center justify-end">
    <div data-tooltip-id="orgTip" data-tooltip-content="Add a new organization">
      <button className="action-btn" onClick={() => setIsOrgModalOpen(true)}>
        <i className="fa-solid fa-circle-plus"></i>&nbsp;Organization
      </button>
    </div>

    <div data-tooltip-id="userTip" data-tooltip-content="Add a new user">
      <button className="action-btn" onClick={() => setIsUserModalOpen(true)}>
        <i className="fa-solid fa-circle-plus"></i>&nbsp;User
      </button>
    </div>

    <Tooltip id="orgTip" place="top" />
    <Tooltip id="userTip" place="top" />
  </div>
</div>

{/* Role Selection and Export Row */}
<div className="role-export-row flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
  {/* Role Toggles */}
  <div className="role-selection flex flex-wrap gap-2 items-center">
    <div data-tooltip-id="orgRoleTip" data-tooltip-content="View and manage organizations">
      <button
        className={`role-btn ${selectedRole === 'organization' ? 'active' : ''}`}
        onClick={() => setSelectedRole('organization')}
      >
        Organizations
      </button>
    </div>

    <div data-tooltip-id="guestRoleTip" data-tooltip-content="View and manage guest users">
      <button
        className={`role-btn ${selectedRole === 'guest' ? 'active' : ''}`}
        onClick={() => setSelectedRole('guest')}
      >
        Guests
      </button>
    </div>

    <Tooltip id="orgRoleTip" place="bottom" />
    <Tooltip id="guestRoleTip" place="bottom" />
  </div>

  {/* Export Button */}
  <div>
    <button
      className="export-btn"
      onClick={handleExportExcel}
      data-tooltip-id="exportTip"
      data-tooltip-content="Export all data and summary chart to an Excel report"
    >
      <i className="fa-solid fa-file-excel"></i>&nbsp;Extract Report
    </button>
    <Tooltip id="exportTip" place="top" />
  </div>
</div>


        {/* Loading */}
        {loading && <div className="loading">Loading...</div>}

        {/* Organizations View */}
        {selectedRole === 'organization' && (
          <div>
            <div className="guest-title-header-row">
            <h3 className="guest-title">Organizations</h3>
            </div>
            {organizations.length === 0 ? (
              <p>No organizations found.</p>
            ) : (
              <div className="org-table-container">
              <div className="org-table">
                <div className="table-header">
                  <div className="expand-cell" />
                  <div>Title</div>
                  <div>Name</div>
                  <div>Admin Email</div>
                  <div>Address</div>
                  <div>Vessel Limit</div>
                  <div>Users</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {organizations.map((org) => (
                  <React.Fragment key={org.orgId}>
                    <div className="organization-card">
                      <div className="expand-cell">
                        <button
                          className="expand-btn"
                          onClick={() => toggleOrg(org.orgId)}
                        >
                          {expandedOrg === org.orgId ? (
                            <i className='fa-solid fa-arrow-down'  style={{color:" #189cc8"}}></i>
                          ) : (
                            <i className='fa-solid fa-arrow-right' style={{color:" #189cc8"}}></i>
                          )}
                        </button>
                      </div>
                      <div className="cell">{org.companyTitle}</div>
                      <div className="cell">{org.companyName}</div>
                      <div className="cell email-cell">
                        {org.organizationAdmin?.userEmail}
                      </div>
                      <div className="cell">{org.address}</div>
                      <div className="cell">{org.vesselLimit}</div>
                      <div className="cell">
                        {org.organizationalUsers?.length || 0}
                      </div>
                      <div>
                                 <span
                                   className={`status-badge ${
                                    org.active ? 'active' : 'inactive'
                                   }`}
                                 >
                                   {org.active ? 'Active' : 'Inactive'}
                                 </span>
                               </div>
                      <div className="card-actions">
                        <ActionMenu
                          isActive={org.active}
                          onEdit={() => handleEditOrg(org)}
                          onDelete={() => handleDeleteOrg(org)}
                          onToggle={() => handleToggleOrgStatus(org)}
                          isAdmin={false}
                        />
                      </div>
                    </div>

                    {expandedOrg === org.orgId && (
                      <div className="expand-details">
                        <div className="user-table">
                          <div className="user-row-header">
                            <div>Name</div>
                            <div>Email</div>
                            <div>Role</div>
                            <div>Status</div>
                            <div>Actions</div>
                          </div>

                          {/* Admin Row */}
                          {org.organizationAdmin && (
                            <div className="user-row admin">
                              <div>
                                {org.organizationAdmin.userFirstName}{' '}
                                {org.organizationAdmin.userLastName}
                              </div>
                              <div className="email-cell">
                                {org.organizationAdmin.userEmail}
                              </div>
                              <div>
                                <span className="user-role-label">Admin</span>
                              </div>

                               <div>
                                 <span
                                   className={`status-badge ${
                                     org.organizationAdmin.active ? 'active' : 'inactive'
                                   }`}
                                 >
                                  {org.organizationAdmin.active ? 'Active' : 'Inactive'}
                                </span>
                               </div>

                              <div className="card-actions">
                                <ActionMenu
                                  isActive={org.organizationAdmin.active}
                                  onEdit={() =>
                                    handleEditUser(org.organizationAdmin, true)
                                  }
                                  onDelete={() =>
                                    handleDeleteUser(org.organizationAdmin, true)
                                  }
                                  onToggle={() =>
                                    handleToggleUserStatus(
                                      org.organizationAdmin.loginUserId,
                                      org.organizationAdmin.active,
                                      true,
                                      org.orgId
                                    )
                                  }
                                  isAdmin={true}
                                />
                              </div>
                            </div>
                          )}

                          {/* Organizational Users */}
                          {org.organizationalUsers?.map((user) => (
                            <div className="user-row" key={user.userId}>
                              <div>
                                {user.userFirstName} {user.userLastName}
                              </div>
                              <div className="email-cell">{user.userEmail}</div>
                              <div>
                                <span className="user-role-label">User</span>
                              </div>
                               <div>
                                 <span
                                   className={`status-badge ${
                                     user.active ? 'active' : 'inactive'
                                   }`}
                                 >
                                   {user.active ? 'Active' : 'Inactive'}
                                 </span>
                               </div>
                              <div className="card-actions">
                                <ActionMenu
                                  isActive={user.active}
                                  onEdit={() => handleEditUser(user, false)}
                                  onDelete={() => handleDeleteUser(user, false)}
                                  onToggle={() =>
                                    handleToggleUserStatus(
                                      user.loginUserId,
                                      user.active,
                                      false,
                                      org.orgId
                                    )
                                  }
                                  isAdmin={false}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              </div>
            )}
          </div>
        )}

      {/* Guests View */}
{selectedRole === 'guest' && (
<div className="guest-users-container">
 <div className="guest-title-header-row">
  <h3 className="guest-title">Guests</h3>
  {guestVesselLimit !== null && (
    <div className="guest-limit">
      <span>
        Vessel Limit: <strong>{guestVesselLimit}</strong>
      </span>
      <button className="edit-limit-btn" onClick={updateGuestVesselLimit}>
        Edit
      </button>
    </div>
  )}
</div>

    {guests.length === 0 ? (
      <p>No guest users found.</p>
    ) : (
      <div className="guest-table">
        <div className="guest-row-header">
          <div>Name</div>
          <div>Email</div>
          <div>Vessel Limit</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {guests.map((guest) => (
          <div className="guest-row" key={guest._id}>
            <div>{guest.userFirstName} {guest.userLastName}</div>
            <div className="email-cell">{guest.userEmail}</div>
            <div>{guest.vesselLimit}</div>
            <div>
              <span
                className={`status-badge ${
                guest.active ? 'active' : 'inactive'
                }`}
              >
                {guest.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="card-actions">
              <ActionMenu
                  isActive={guest.active}// You can manage this dynamically if needed
                onEdit={() => handleEditUser(guest, false)}
                onDelete={() => handleDeleteUser(guest, false)}
                onToggle={() =>
                  handleToggleUserStatus(
                    guest.loginUserId,
                    guest.active,
                    false
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default UserManagement;
