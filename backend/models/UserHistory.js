import mongoose from 'mongoose';

const UserHistorySchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  orgId: { type: String, default: null },
  userType: {
    type: String,
    required: true,
    enum: ['organizational user', 'guest'],
  },
  selectedOrganization: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  address: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  contactEmail: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  userFirstName: {
    type: String,
    required: true,
  },
  userLastName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true
  },

  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: String },
  orgDeleted: { type: String, default: false }
  
 
}, {
  timestamps: true,
});

const UserHistory = mongoose.model('usersHistory', UserHistorySchema, 'usersHistory');

export default UserHistory;
