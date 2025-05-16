import mongoose from 'mongoose';

  const PolyLineGeofenceSchema = new mongoose.Schema({
    // geofenceId: String,
    geofenceName: String,
    type: { type: String, default: "Polyline" }, // Always "Polyline"
    geofenceType: String,
    seaport: String,
    // date: String,
    remarks: String,
    coordinates: Array,
}, { timestamps: true });



const PolyLineGeofence = mongoose.model('polylinegeofences', PolyLineGeofenceSchema , 'polylinegeofences');

export default  PolyLineGeofence ;

