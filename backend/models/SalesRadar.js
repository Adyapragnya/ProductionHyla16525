import mongoose from 'mongoose';


const SalesRadarSchema = new mongoose.Schema({
   
    Flag: {
        type: String,
        enum: ['individual', 'bulk'],
        required: true
    },
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
    Amount : Number

}, { timestamps: true });

const SalesRadar = mongoose.model('salesradar', SalesRadarSchema, 'salesradar');


// Export the model
export default   SalesRadar ;
