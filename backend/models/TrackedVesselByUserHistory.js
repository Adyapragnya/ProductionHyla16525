// models/TrackedVesselByUserHistory.js
import mongoose from 'mongoose';

const trackedVesselByUserHistorySchema = new mongoose.Schema({
  loginUserId: { type: String, required: true },
  email: String,
  IMO: Number,
  AdminId: String,
  OrgId: String,
  AddedDate: Date,
  favorite: Boolean,
  userDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: String }
}, { timestamps: true });

const TrackedVesselByUserHistory = mongoose.model(
  'vesselstrackedbyuserhistory',
  trackedVesselByUserHistorySchema,
  'vesselstrackedbyuserhistory'
);

export default TrackedVesselByUserHistory;
