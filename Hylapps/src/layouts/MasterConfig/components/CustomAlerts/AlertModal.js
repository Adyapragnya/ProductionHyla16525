import React from "react";
import PropTypes from "prop-types";
import "./AlertModal.css";

const AlertModal = ({
  isOpen,
  onClose,
  children,
  onAdd,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {children}
      </div>
    </div>
  );
  
};

// ✅ Add prop validation
AlertModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

export default AlertModal;
