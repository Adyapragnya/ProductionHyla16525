import mongoose from 'mongoose';


const SalesRadarHistorySchema = new mongoose.Schema({
    loginUserId: String,
    AdminId: String,
    OrgId: String,
    SalesQuotationNumber : String,
    CaseId : Number,
    SalesResponsible : String,
    CustomerOwner : String,
    VesselName : String,
    IMO : Number,
    Priority : String,
    DateOfLastSentQuote : String,

    userDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String }

}, { timestamps: true });

const SalesRadarHistory = mongoose.model('salesradarhistory', SalesRadarHistorySchema, 'salesradarhistory');


// Export the model
export default   SalesRadarHistory ;
