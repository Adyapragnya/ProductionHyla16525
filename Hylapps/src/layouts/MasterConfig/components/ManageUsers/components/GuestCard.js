import React from 'react';

const GuestCard = ({ guest }) => {
  return (
    <div className="card-row guest-card">
      <div className="card-item">{guest.userFirstName} {guest.userLastName}</div>
      <div className="card-item">{guest.userEmail}</div>
      <div className="card-item">{guest.vesselLimit}</div>
      <div className="card-item">
        <button className="action-btn">Modify</button>
        <button className="action-btn">Delete</button>
        <button className="action-btn">Activate/Deactivate</button>
      </div>
    </div>
  );
};

export default GuestCard;
