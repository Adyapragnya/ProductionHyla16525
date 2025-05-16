import mongoose from 'mongoose';


const OpsRadarSchema = new mongoose.Schema({

    Flag: {
        type: String,
        enum: ['individual', 'bulk'],
        required: true
    },
    loginUserId: String,
    AdminId: String,
    OrgId: String,
    
    IMO : Number,
    VesselName: String,
    CaseId : Number,
    Agent : String,
    AgentName : String,
    Info1 : String,
    ETA : String,
   
  

}, { timestamps: true });

const OpsRadar = mongoose.model('opsradar', OpsRadarSchema, 'opsradar');


// Export the model
export default  OpsRadar ;
