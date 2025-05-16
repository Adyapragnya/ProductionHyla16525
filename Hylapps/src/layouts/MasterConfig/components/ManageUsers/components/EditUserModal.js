import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

const EditUserModal = ({ isOpen, onRequestClose, selectedUser, isAdmin, onSuccess }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    console.log(selectedUser);
    if (selectedUser) {
      setUserData({
        firstName: selectedUser.userFirstName,
        lastName: selectedUser.userLastName,
        email: selectedUser.userEmail,
      });
    }
  }, [selectedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    
      const emailChanged = userData.email !== selectedUser.userEmail;

if (emailChanged) {
  const emailCheckResponse = await axios.get(`${baseURL}/api/settings/users-management/users/check-email`, {
    params: { email: userData.email },
  });

  if (emailCheckResponse.data.exists) {
    Swal.fire('Error', 'Email already exists!', 'error');
    setIsLoading(false);
    return;
  }
}


        await axios.put(`${baseURL}/api/settings/users-management/edit-user/${selectedUser._id}`, {
          ...userData,
          isAdmin: true,
        });


      Swal.fire('Success', 'User updated successfully!', 'success');
      onSuccess(); // Trigger success callback to reload data
      onRequestClose(); // Close the modal
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to update user.', 'error');
    } finally {
      setIsLoading(false);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>{isAdmin ? 'Edit Admin' : 'Edit User'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={labelStyle}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div className="form-group">
            <label style={labelStyle}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div className="form-group">
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={isLoading} style={btnStyle}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Modal>
  );
};


EditUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userFirstName: PropTypes.string,
    userLastName: PropTypes.string,
    userEmail: PropTypes.string,
  }),
  isAdmin: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
};

export default EditUserModal;
