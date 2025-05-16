import mongoose from 'mongoose';

const PolygonGeofenceSchema = new mongoose.Schema({
    // geofenceId: String,
    geofenceName: String,
    type: { type: String, default: "Polygon" }, 
    geofenceType: String,
    seaport: String,
    // date: String,
    remarks: String,
    coordinates: Array,
    
  }, { timestamps: true });

const PolygonGeofence = mongoose.model('polygongeofences', PolygonGeofenceSchema , 'polygongeofences');

export default  PolygonGeofence ;
