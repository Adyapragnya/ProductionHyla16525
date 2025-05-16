import React from 'react';

const RoleSwitcher = ({ selectedRole, onChange }) => (
  <div className="role-selection">
    <button
      className={`role-btn ${selectedRole === 'organization' ? 'active' : ''}`}
      onClick={() => onChange('organization')}
    >
      Organizations
    </button>
    <button
      className={`role-btn ${selectedRole === 'guest' ? 'active' : ''}`}
      onClick={() => onChange('guest')}
    >
      Guests
    </button>
  </div>
);

export default RoleSwitcher;
