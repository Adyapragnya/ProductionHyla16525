// models/Organization.js
import mongoose from 'mongoose';


const organizationHistorySchema = new mongoose.Schema({
  orgId: { type: String, required: true },
  companyTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
 
  vesselLimit: { type: Number, required: true }, 
  adminFirstName: { type: String, required: true },
  adminLastName: { type: String, required: true },
  adminEmail: { type: String, required: true },
  adminContactNumber: { type: String, required: true },


  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: String }
});

const OrganizationHistory =  mongoose.model('organizationsHistory', organizationHistorySchema, 'organizationsHistory');

export default   OrganizationHistory ;
