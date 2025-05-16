import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Module.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash';

const App = () => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [moduleKeys, setModuleKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const [usersRes, orgsRes] = await Promise.all([
          axios.get(`${baseURL}/api/permissions/all-user-permissions`),
          axios.get(`${baseURL}/api/permissions/organizations`)
        ]);

        const fetchedUsers = usersRes.data.users;
        const fetchedOrgs = orgsRes.data.organizations;

        const orgMap = {};
        fetchedOrgs.forEach((org) => {
          if (org.orgId) {
            orgMap[org.orgId] = org.companyTitle;
          }
        });

        const usersWithOrg = fetchedUsers.map((user) => ({
          ...user,
          companyTitle: orgMap[user.orgId] || 'N/A',
          permissions: {
            ...user.permissions,
            modulePermissions: user.permissions?.modulePermissions || {}
          }
        }));

        setUsers(usersWithOrg);
        setOrganizations(fetchedOrgs);

        if (usersWithOrg.length > 0) {
          const firstUserPermissions = usersWithOrg[0].permissions?.modulePermissions || {};
          setModuleKeys(Object.keys(firstUserPermissions));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Data Fetch Error',
          text: 'Failed to load user or organization data.',
        });
      }
    };

    fetchData();
  }, []);

  const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), []);

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (selectedRole === 'organization') {
      filtered = filtered.filter(
        (user) =>
          (user.role === 'organization admin' || user.role === 'organizational user') &&
          (selectedOrgId ? user.orgId?.toUpperCase() === selectedOrgId.toUpperCase() : true)
      );
    } else if (selectedRole === 'guest') {
      filtered = filtered.filter((user) => user.role === 'guest');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term) ||
          user.companyTitle?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [users, selectedRole, selectedOrgId, searchTerm]);

  const togglePermission = useCallback((userId, moduleKey) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                modulePermissions: {
                  ...user.permissions.modulePermissions,
                  [moduleKey]: !user.permissions.modulePermissions[moduleKey],
                },
              },
            }
          : user
      )
    );
  }, []);

  const handleSave = useCallback(async (user) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      await axios.put(
        `${baseURL}/api/permissions/update-user-permissions/${user.userId}`,
        {
          modulePermissions: { ...user.permissions.modulePermissions },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Permissions Updated',
        text: `Permissions updated for ${user.email}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Save failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        text: 'There was an error while saving permissions.',
      });
    }
  }, []);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Permissions');

    const headerRow = ['Email', 'Role', ...moduleKeys];
    worksheet.addRow(headerRow);

    filteredUsers.forEach(user => {
      const row = [user.email, user.role];
      moduleKeys.forEach(key => {
        row.push(user.permissions.modulePermissions[key] ? '✓' : '🗙');
      });
      worksheet.addRow(row);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      row.eachCell((cell, colNumber) => {
        if (colNumber > 2) {
          if (cell.value === '✓') {
            cell.font = { color: { argb: 'FF008000' } };
          } else if (cell.value === '🗙') {
            cell.font = { color: { argb: 'FFFF0000' } };
          }
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'Hyla_User_Permissions_Report.xlsx');
  };

  if (loading) {
    return <div className="alert-form-container" style={{ marginTop: '15px' }}>Loading data...</div>;
  }

  return (
    <div className="alert-form-container" style={{ marginTop: '15px' }}>
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
            Select Role:
          </label>
          <select
            style={{ border: '1px solid #bbb', padding: '6px 10px', borderRadius: '5px', fontSize: '14px', outline: 'none' }}
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setSelectedOrgId('');
            }}
          >
            <option value="">-- Select Role --</option>
            <option value="organization">Organization</option>
            <option value="guest">Guest</option>
          </select>

          {selectedRole === 'organization' && (
            <>
              <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                Select Organization:
              </label>
              <select
                style={{ border: '1px solid #bbb', padding: '6px 10px', borderRadius: '5px', fontSize: '14px', outline: 'none' }}
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
              >
                <option value="">-- All Organizations --</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org.orgId}>
                    {org.companyTitle}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #bbb',
              borderRadius: '5px',
              fontSize: '14px',
              outline: 'none',
              minWidth: '200px'
            }}
          />
          <button
            onClick={handleExportExcel}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className='fa-solid fa-file-excel'></i>&nbsp;Export Excel
          </button>
        </div>
      </div>

      <div className="permissions-table-container">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Role</th>
              {moduleKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={moduleKeys.length + 3}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  {moduleKeys.map((key) => (
                    <td key={key}>
                      <input
                        type="checkbox"
                        checked={!!user.permissions.modulePermissions[key]}
                        onChange={() => togglePermission(user.userId, key)}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      className="small-save-button"
                      onClick={() => handleSave(user)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
