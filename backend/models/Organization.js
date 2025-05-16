// models/Organization.js
import mongoose from 'mongoose';


const organizationSchema = new mongoose.Schema({
  orgId: { type: String, required: true, unique: true },
  companyTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String  },
  // contactEmail: { type: String, required: true },
  vesselLimit: { type: Number, required: true }, 
  adminFirstName: { type: String, required: true },
  adminLastName: { type: String, required: true },
  adminEmail: { type: String, required: true , unique: true },
  adminContactNumber: { type: Number, required: true },
  // files: { type: [String], default: [] },
  active: { type: Boolean, default: true },

});

const Organization =  mongoose.model('organizations', organizationSchema, 'organizations');

export default   Organization ;



