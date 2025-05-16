// Define Geofence schema
import mongoose from 'mongoose';

const polyCircleSchema = new mongoose.Schema({
    // geofenceId: String,
    geofenceName: String,
    type: { type: String, default: "Polycircle" }, 
    geofenceType: String,
    seaport: String,
    // date: Date,
    remarks: String,
    coordinates: [{ lat: Number, lng: Number, radius: Number }]
}, { timestamps: true });

const PolyCircleGeofence = mongoose.model('polycirclegeofences', polyCircleSchema, "polycirclegeofences");


export default  PolyCircleGeofence ;
