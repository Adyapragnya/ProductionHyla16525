import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import './UpdateOrganizationModal.css';

const UpdateOrganizationModal = ({ isOpen, onRequestClose, onSuccess, selectedOrg }) => {
  const [formData, setFormData] = useState({
    companyTitle: '',
    vesselLimit: '',
  });

  useEffect(() => {
    Modal.setAppElement('#root');
    console.log("Modal isOpen:", isOpen);
    console.log("Selected Organization:", selectedOrg);

    if (selectedOrg) {
      setFormData({
        companyTitle: selectedOrg.companyTitle,
        vesselLimit: selectedOrg.vesselLimit,
      });
    }
  }, [isOpen, selectedOrg]); 

  useEffect(() => {
    console.log("Modal isOpen:", isOpen);  // Log the modal open state
    console.log("Selected Organization:", selectedOrg);  // Log the selected organization
  }, [isOpen, selectedOrg]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  

  useEffect(() => {
    console.log("Selected Organization", selectedOrg);  // Check if the data is being passed correctly
    if (selectedOrg) {
      setFormData({
        companyTitle: selectedOrg.companyTitle,
        vesselLimit: selectedOrg.vesselLimit,
      });
    }
  }, [selectedOrg]);
  



  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    try {
      await axios.put(
        `${baseURL}/api/settings/users-management/update-organization/${selectedOrg._id}`,
        formData
      );
      Swal.fire('Success', 'Organization updated successfully', 'success');
      onSuccess(); // Refresh the data
      onRequestClose(); // Close the modal
    } catch (error) {
      Swal.fire('Error', 'Could not update organization', 'error');
    }
  };

      
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal" overlayClassName="overlay" contentLabel="modify User">
      <h2>Edit Organization</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Company Title:</label>
          <input
            name="companyTitle"
            type="text"
            value={formData.companyTitle}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Vessel Limit:</label>
          <input
            name="vesselLimit"
            type="number"
            value={formData.vesselLimit}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Organization</button>
      </form>
    </Modal>
  );
};

export default UpdateOrganizationModal;
