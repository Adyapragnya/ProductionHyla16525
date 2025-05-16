// models/DeletedOrganizationLog.js
import mongoose from 'mongoose';

const deletedOrganizationLogSchema = new mongoose.Schema({
  deletedAt: {
    type: Date,
    default: Date.now
  },
  performedBy: {
    type: String,
    required: true
  },
  organizationHistory_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'OrganizationHistory'
  },
  deletedUserLog_ids: {
    orgAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeletedUserLog'
      }
    ],
    orgUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeletedUserLog'
      }
    ]
  }
}, {
  timestamps: true  // adds createdAt and updatedAt
});

const DeletedOrganizationLog = mongoose.model(
  'deletedOrganizationLog',
  deletedOrganizationLogSchema,
  'deletedOrganizationLog'
);

export default DeletedOrganizationLog;
