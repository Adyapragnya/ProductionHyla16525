import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import axios from 'axios';
import './CreateUserModal.css';
import PropTypes from 'prop-types';


const CreateUserModal = ({ isOpen, onRequestClose, onSuccess }) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const [formData, setFormData] = useState({
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userType: '',
    orgId: '',
  });

  const [organizations, setOrganizations] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("User Type: ", formData.userType);
    if (formData.userType === 'organizational user') {
      axios
        .get(`${baseURL}/api/settings/users-management/organizations`)
        .then(({ data }) => {
          console.log(data); // Log the response data
          if (Array.isArray(data.organizations)) {
            setOrganizations(data.organizations);  // Access the organizations array from the response
          } else {
            setOrganizations([]);  // Clear organizations if data is not an array
          }
        })
        .catch((error) => {
          console.error("Error fetching organizations:", error);
          Swal.fire('Error', 'Failed to load organizations', 'error');
        });
    }
  }, [formData.userType]);
  

  const validateEmail = (email) => {
    // This regex checks for a more robust email format
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.toLowerCase());
  };
  
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userFirstName) newErrors.userFirstName = 'Required';
    if (!formData.userLastName) newErrors.userLastName = 'Required';
    if (!validateEmail(formData.userEmail)) newErrors.userEmail = 'Invalid email';
    if (formData.userType === 'organizational user' && !formData.orgId) {
      newErrors.orgId = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userEmail') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toLowerCase(),  // Convert email to lowercase
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

     // Send correct field names to backend
  const userData = {
    userType: formData.userType,
    firstName: formData.userFirstName,  // Use correct field names
    lastName: formData.userLastName,
    email: formData.userEmail,
    orgId: formData.orgId,  // Only for organizational user
  };


    try {
      await axios.post(`${baseURL}/api/settings/users-management/create-user`, userData);
      Swal.fire('Success', 'User created and login email sent.', 'success');
  // Reset the form and errors after successful submission
  setFormData({
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userType: '',
    orgId: '',
  });
  setErrors({});  // Clear error messages
      onRequestClose();
      onSuccess();
    } catch (error) {
      Swal.fire('Error', error?.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="user-modal"
      overlayClassName="user-modal-overlay"
      contentLabel="Create User"
    >
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-grid">

        <select name="userType" value={formData.userType} onChange={handleChange}>
            <option value="">Select Role</option>  {/* Default option */}
            <option value="organizational user">Organizational User</option>
            <option value="guest">Guest</option>
          </select>

          {formData.userType === 'organizational user' && (
            <select name="orgId" value={formData.orgId} onChange={handleChange} required>
              <option value="">Select Organization</option>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <option key={org.orgId} value={org.orgId}>
                    {org.companyName}
                  </option>
                ))
              ) : (
                <option disabled>No organizations available</option>
              )}
            </select>
          )}

          <input
            name="userFirstName"
            placeholder="First Name *"
            value={formData.userFirstName}
            onChange={handleChange}
            required
          />
          <input
            name="userLastName"
            placeholder="Last Name *"
            value={formData.userLastName}
            onChange={handleChange}
            required
          />
          <input
            name="userEmail"
            type="email"
            placeholder="Email *"
            value={formData.userEmail}
            onChange={handleChange}
            required
          />
        {errors.userEmail && <span className="error-text">{errors.userEmail}</span>}

        
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

CreateUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};


export default CreateUserModal;
