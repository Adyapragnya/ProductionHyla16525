import mongoose from 'mongoose';


const OpsRadarHistorySchema = new mongoose.Schema({
    loginUserId: String,
    AdminId: String,
    OrgId: String,
    IMO : Number,
    CaseId : Number,
    Agent : String,
    AgentName : String,
    Info1 : String,
    ETA : String,
   
    userDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String }
  

}, { timestamps: true });

const OpsRadarHistory = mongoose.model('opsradarhistory', OpsRadarHistorySchema, 'opsradarhistory');


// Export the model
export default  OpsRadarHistory ;
