import mongoose from 'mongoose';


// Counter model for managing orgId sequences
const OrgCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // This will hold the collection name
    seq: { type: Number, default: 555 } // Start from 555
  });
  
  const OrgCounter = mongoose.model('counters', OrgCounterSchema, 'counters');

  export default OrgCounter;