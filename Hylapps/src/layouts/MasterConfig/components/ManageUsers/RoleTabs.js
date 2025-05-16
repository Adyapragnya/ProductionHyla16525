import React from 'react';
import './Module.css';

const RoleTabs = ({ selectedRole, onChange }) => {
  return (
    <div className="role-tabs-container">
      {['organization', 'guest'].map((role) => (
        <button
          key={role}
          className={`tab-button ${selectedRole === role ? 'active' : ''}`}
          onClick={() => onChange(role)}
        >
          {role === 'organization' ? '🏢 Organizations' : '👤 Guests'}
        </button>
      ))}
    </div>
  );
};

export default RoleTabs;
