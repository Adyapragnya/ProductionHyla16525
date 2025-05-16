import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import PropTypes from 'prop-types';


export default function ActionMenu({ onEdit, onDelete, onToggle, isActive, isAdmin  }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        className="menu-btn"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FaEllipsisV />
      </button>
      {open && (
        <ul className="menu-dropdown" role="menu">
          <li
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </li>

         
             {!isAdmin && (
          <li
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </li>
            )}
         
         {!isAdmin && (
         <li
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onToggle();
            }}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </li>
            )}


        </ul>
      )}
    </div>
  );
}

ActionMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};