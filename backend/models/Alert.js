// models/Alert.js
import mongoose from 'mongoose';

const AisConditionSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const AlertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    enum: ["ais", "geofence", "both"],
    required: true,
  },

  ais: {
    conditions: [AisConditionSchema],
    logicalOperator: {
      type: String,
      enum: ["AND", "OR"],
    
    }
  },

  geofence: {
    geofenceId: { type: String },
    type: { type: String },         // ⬅️ Store 'Polycircle', 'Polygon','Polyline' etc.
    portUNLOCODE: { type: String }
  },

  createdBy: {
    loginUserId: { type: String, required: true },
    email: { type: String, required: true },
  },

  recipients: {
    type: [String],
    default: []
  },
  vessels: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});


const Alert = mongoose.model("alerts", AlertSchema,"alerts");

export default  Alert;
