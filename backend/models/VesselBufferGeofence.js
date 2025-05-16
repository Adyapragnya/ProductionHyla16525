import mongoose from 'mongoose';


const VesselBufferGeofenceSchema = new mongoose.Schema({
    type:  { type: String, default: "VesselBuffer" }, 
    IMO: { type: Number, required: true }, // Vessel IMO number
    NAME: { type: String, required: true }, // Vessel name
    TIMESTAMP: { type: String, required: true }, // Timestamp
    LATITUDE: { type: Number, required: true }, // Latitude
    LONGITUDE: { type: Number, required: true }, // Longitude
    radius: { type: Number, required: true }, // Buffer radius in meters

}, { timestamps: true });

const VesselBufferGeofence = mongoose.model('vesselbuffergeofences', VesselBufferGeofenceSchema , 'vesselbuffergeofences');


// Export the model
export default   VesselBufferGeofence ;



