
import mongoose from 'mongoose';

const VesselLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const VesselLimit = mongoose.model('vesselLimit', VesselLimitSchema, 'vesselLimit');

 export default VesselLimit;