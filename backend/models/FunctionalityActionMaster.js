// models/FunctionalityActionMaster.js
const mongoose = require('mongoose');

const FunctionalityActionMasterSchema = new mongoose.Schema({
  functionalityKey: { type: String, required: true, unique: true }, // e.g., "vessel", "geofence"
  allowedActions: [{ type: String, enum: ['add', 'edit', 'delete', 'view'] }]
});

const FunctionalityActionMaster = mongoose.model('functionalityActionMaster', FunctionalityActionMasterSchema, 'functionalityActionMaster');

export default FunctionalityActionMaster;
