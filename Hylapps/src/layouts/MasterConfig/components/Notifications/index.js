import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import './Module.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ALL_ALERT_FIELDS = [
  { key: 'customAlertCreate', label: 'Custom Alert Create' },
  { key: 'geofenceAlerts', label: 'Geo-Fence Alerts' },
  { key: 'customAlerts', label: 'Custom Alerts' },
];

const roleOptions = [
  { value: '', label: 'All' },
  { value: 'guest', label: 'Guest' },
  { value: 'organization', label: 'Organization' },
];

// Custom debounce hook
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const Notifications = () => {
  const [originalUsers, setOriginalUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedRoleType, setSelectedRoleType] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUserAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/permissions/user-alerts/get-overview`);
        if (!res.ok) throw new Error('Failed to fetch users with alerts');
        const data = await res.json();

        const orgs = [...new Set(data.map((user) => user.organizationName).filter(Boolean))];
        setOrganizationNames(orgs);

        const enrichedUsers = data.map((user) => ({
          ...user,
          alerts: {
            customAlertCreate: user.alerts?.customAlertCreate ?? false,
            geofenceAlerts: user.alerts?.geofenceAlerts ?? false,
            customAlerts: user.alerts?.customAlerts ?? false,
          },
        }));

        setAllUsers(enrichedUsers);
        setOriginalUsers(JSON.parse(JSON.stringify(enrichedUsers))); // Deep clone
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAlerts();
  }, []);

  const handleToggle = (userIndex, alertKey) => {
    setAllUsers((prev) => {
      const updated = [...prev];
      const user = { ...updated[userIndex] };
      user.alerts = {
        ...user.alerts,
        [alertKey]: !user.alerts[alertKey],
      };
      updated[userIndex] = user;
      return updated;
    });
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return allUsers.filter((user) => {
      const roleMatch = !selectedRoleType || (
        selectedRoleType === 'guest'
          ? user.role === 'guest'
          : ['organization admin', 'organizational user'].includes(user.role)
      );

      const orgMatch = !selectedOrganization || user.organizationName === selectedOrganization;

      const email = user.email?.toLowerCase() || '';
      const role = user.role?.toLowerCase() || '';
      const orgName = user.organizationName?.toLowerCase() || '';

      const searchMatch = email.includes(normalizedSearch) ||
                          role.includes(normalizedSearch) ||
                          orgName.includes(normalizedSearch);

      return roleMatch && orgMatch && searchMatch;
    });
  }, [allUsers, selectedRoleType, selectedOrganization, debouncedSearch]);

  const handleUserSave = async (user) => {
    const originalUser = originalUsers.find((u) => u.loginUserId === user.loginUserId);
    const changedAlerts = {};

    for (const key in user.alerts) {
      if (user.alerts[key] !== originalUser.alerts[key]) {
        changedAlerts[key] = user.alerts[key];
      }
    }

    if (Object.keys(changedAlerts).length === 0) {
      Swal.fire('Info', 'No changes to save for this user.', 'info');
      return;
    }

    try {
      const payload = {
        loginUserId: user.loginUserId,
        alerts: changedAlerts,
      };

      const res = await fetch(`${API_BASE_URL}/api/permissions/user-alerts/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save alert permissions.');

      Swal.fire('Success', `Permissions updated for ${user.email}`, 'success');

      setOriginalUsers((prev) =>
        prev.map((u) =>
          u.loginUserId === user.loginUserId ? { ...u, alerts: { ...u.alerts, ...changedAlerts } } : u
        )
      );
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="alert-form-container" style={{ marginTop: '6px' }}>
      {isLoading && (
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
          <Typography variant="h6" align="center" gutterBottom mt={2}>
            Please wait! Loading data...
          </Typography>
          <CircularProgress color="primary" size={60} />
        </Box>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#0f67b1' }}>User Alert Permissions</h2>
      </div>
      <hr />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '200px' }}>
          <label htmlFor="roleSelect" style={{ display: 'block', marginBottom: '4px' }}>
            User Role
          </label>
          <select
            id="roleSelect"
            value={selectedRoleType}
            onChange={(e) => {
              setSelectedRoleType(e.target.value);
              setSelectedOrganization('');
            }}
            style={{
              cursor: 'pointer',
              width: '100%',
              padding: '6px 8px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {selectedRoleType === 'organization' && (
          <div style={{ minWidth: '200px' }}>
            <label htmlFor="organizationSelect" style={{ display: 'block', marginBottom: '4px' }}>
              Organization Name
            </label>
            <select
              id="organizationSelect"
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              style={{
                cursor: 'pointer',
                width: '100%',
                padding: '6px 8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            >
              <option value="">All Organizations</option>
              {organizationNames.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search + Count */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}>
        <Typography variant="h5" gutterBottom style={{ margin: '0.5rem 0' }}>
          {filteredUsers.length > 0
            ? `Users (${filteredUsers.length})`
            : 'No users to display'}
        </Typography>

        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '250px',
            maxWidth: '100%',
            margin: '0.5rem 0',
          }}
        />
      </div>

      {/* Table */}
      <div className="permissions-table-container">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Role</th>
              {ALL_ALERT_FIELDS.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.loginUserId}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  {ALL_ALERT_FIELDS.map((field) => (
                    <td key={field.key}>
                      <input
                        type="checkbox"
                        checked={user.alerts[field.key]}
                        onChange={() =>
                          handleToggle(
                            allUsers.findIndex((u) => u.loginUserId === user.loginUserId),
                            field.key
                          )
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => handleUserSave(user)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0f67b1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={ALL_ALERT_FIELDS.length + 2} style={{ textAlign: 'center' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifications;
