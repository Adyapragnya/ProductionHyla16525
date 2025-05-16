import React, { useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import axios from 'axios';
import './CreateOrganizationModal.css';
import PropTypes from 'prop-types';


const CreateOrganizationModal = ({ isOpen, onRequestClose, onSuccess }) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const [formData, setFormData] = useState({
    companyTitle: '',
    companyName: '',
    address: '',
    vesselLimit: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminContactNumber: '',
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const validatePhoneNumber = (phone) => {
    const numericOnly = /^\d+$/;
  
    // First, ensure the input is only digits
    if (!numericOnly.test(phone)) {
      return false;
    }
  
    // Then check for valid patterns
    const indiaPattern = /^[6-9]\d{9}$/;         // 10-digit Indian numbers starting with 6-9
    const usaPattern = /^\d{10}$/;               // 10-digit US numbers (strictly numeric)
  
    return indiaPattern.test(phone) || usaPattern.test(phone);
  };
  

  const handleCompanyTitleChange = (e) => {
    const input = e.target.value;
    if (/^[a-zA-Z]*$/.test(input) && input.length <= 6) {
      setFormData((prev) => ({ ...prev, companyTitle: input }));
      setErrors((prev) => ({ ...prev, companyTitle: '' }));
    } else {
      setErrors((prev) => ({
        ...prev,
        companyTitle: 'Only alphabets allowed, max 6 characters',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }

    if (!validatePhoneNumber(formData.adminContactNumber)) {
      newErrors.adminContactNumber = 'Enter valid 10-digit number';
    }

    if (!formData.companyTitle || !/^[a-zA-Z]{1,6}$/.test(formData.companyTitle)) {
      newErrors.companyTitle = 'Only alphabets allowed, max 6 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await axios.post(`${baseURL}/api/settings/users-management/create-organization`, formData);
      Swal.fire('Success', 'Organization created and email sent to admin.', 'success');
      onRequestClose();
      onSuccess(); // refresh list
    } catch (error) {
   
      Swal.fire('Error', error?.response?.data?.error || 'Something went wrong', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Create Organization"
      className="org-modal"
      overlayClassName="org-modal-overlay"
    >
      <h2 className="modal-title">Create New Organization</h2>
      <form onSubmit={handleSubmit} className="org-form">
        <div className="form-grid">
          <div>
            <input
              name="companyTitle"
              placeholder="Company Title *"
              value={formData.companyTitle}
              onChange={handleCompanyTitleChange}
              required
            />
            {errors.companyTitle && <p className="error-text">{errors.companyTitle}</p>}
          </div>

          <input name="companyName" placeholder="Company Name *" required onChange={handleChange} />
          <input name="address" placeholder="Address" onChange={handleChange} />
          <input
            name="vesselLimit"
            type="number"
            placeholder="Vessel Limit *"
            required
            min="1"
            onChange={handleChange}
          />
          <input name="adminFirstName" placeholder="Admin First Name *" required onChange={handleChange} />
          <input name="adminLastName" placeholder="Admin Last Name *" required onChange={handleChange} />
          <div>
            <input
              name="adminEmail"
              type="email"
              placeholder="Admin Email *"
              required
              onChange={handleChange}
            />
            {errors.adminEmail && <p className="error-text">{errors.adminEmail}</p>}
          </div>
          <div>
            <input
              name="adminContactNumber"
              placeholder="Admin Contact Number *"
              required
              onChange={handleChange}
            />
            {errors.adminContactNumber && <p className="error-text">{errors.adminContactNumber}</p>}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onRequestClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

CreateOrganizationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};


export default CreateOrganizationModal;
