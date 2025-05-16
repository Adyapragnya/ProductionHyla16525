import mongoose from 'mongoose';
import { stringify } from 'uuid';

const TerrestrialGeofenceSchema = new mongoose.Schema({
    // geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    type: { type: String, default: "Advanced" },
    seaport: String,
    location: String,
    // date: String,
    remarks: String,
   
    coordinates: Array,
    
  },  { timestamps: true });

const TerrestrialGeofence = mongoose.model('TerrestrialGeofence', TerrestrialGeofenceSchema, 'TerrestrialGeofence');

export default  TerrestrialGeofence ;



