import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';

const EditOrganizationModal = ({ isOpen, onRequestClose, orgData, onSuccess }) => {
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyTitle: '',
    companyName: '',
    address: '',
    vesselLimit: '',
  });

  useEffect(() => {
    if (orgData) {
      setFormData({
        companyTitle: orgData.companyTitle || '',
        companyName: orgData.companyName || '',
        address: orgData.address || '',
        vesselLimit: orgData.vesselLimit || '',
      });
    }
  }, [orgData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate the form data
  const validateForm = () => {
    let newErrors = {};

    // Company Title Validation (only alphabets, max 6 characters)
    if (!formData.companyTitle || !/^[a-zA-Z]{1,6}$/.test(formData.companyTitle)) {
      newErrors.companyTitle = 'Only alphabets allowed, max 6 characters';
    }

    // Add any other validation checks for other fields here...

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if there are no errors
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // If validation fails, prevent the form from being submitted
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/settings/users-management/update-org/${orgData.orgId}`, formData);
      onSuccess();
      onRequestClose();
    } catch (err) {
      console.error('Failed to update organization', err);
    }
  };

  const modalStyle = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9999,
    },
    content: {
      background: '#fff',
      borderRadius: '8px',
      maxWidth: '600px',
      width: '90%',
      padding: '20px',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    },
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    marginBottom: '15px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '5px',
  };

  const btnStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#0F67B1',
    marginTop: '10px',
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Edit Organization</h2>
        <button onClick={onRequestClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
          <FaTimes color="#888" />
        </button>
      </div>

      <div>
        <label style={labelStyle}>Company Title</label>
        <input
          style={inputStyle}
          name="companyTitle"
          value={formData.companyTitle}
          onChange={handleChange}
        />
        {errors.companyTitle && <div style={{ color: 'red',marginTop: '-3px' , marginBottom: '2px' }}>{errors.companyTitle}</div>}

        <label style={labelStyle}>Company Name</label>
        <input
          style={inputStyle}
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />

        <label style={labelStyle}>Address</label>
        <input
          style={inputStyle}
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <label style={labelStyle}>Vessel Limit</label>
        <input
          style={inputStyle}
          name="vesselLimit"
          value={formData.vesselLimit}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={btnStyle} onClick={handleSubmit}>Save Changes</button>
      </div>
    </Modal>
  );
};


EditOrganizationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  orgData: PropTypes.shape({
    orgId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    companyTitle: PropTypes.string,
    companyName: PropTypes.string,
    address: PropTypes.string,
    vesselLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default EditOrganizationModal;
