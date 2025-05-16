import React, { useState } from 'react';

const OrganizationCard = ({ organization }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleDetails = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="card-row organization-card">
      <div className="card-item">{organization.companyTitle}</div>
      <div className="card-item">{organization.companyName}</div>
      <div className="card-item">{organization.address}</div>
      <div className="card-item">{organization.organizationAdmin.userEmail}</div>
      <div className="card-item">{organization.vesselLimit}</div>
      <div className="card-item">{organization.organizationalUsers.length}</div>
      <div className="card-item">
        <button className="action-btn" onClick={toggleDetails}>
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {expanded && (
        <div className="organization-details">
          <div className="detail-section">
            <h5>Admin</h5>
            <div>{organization.organizationAdmin.userFirstName} {organization.organizationAdmin.userLastName}</div>
            <div>{organization.organizationAdmin.userEmail}</div>
          </div>
          <div className="detail-section">
            <h5>Users</h5>
            {organization.organizationalUsers.map((user) => (
              <div key={user.userEmail}>
                <p>{user.userFirstName} {user.userLastName}</p>
                <span>{user.userEmail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationCard;
