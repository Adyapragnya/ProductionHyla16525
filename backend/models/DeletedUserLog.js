import mongoose from 'mongoose';

const deletedUserLogSchema = new mongoose.Schema({
  deletedAt: { type: Date, default: Date.now },
  performedBy: { type: String, required: true }, // e.g., admin ID or name
  role: {
    type: String,
    enum: ['organization admin', 'organizational user', 'guest'],
    required: true
  },
  
  loginUserId: String,
  loginUserHistory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoginUserHistory',
    default: null
  },

  trackedVesselByUser: [{
    trackedVesselByUserHistory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackedVesselByUserHistory'
    },
    IMO: String,
    AddedDate: Date
  }],


  opsRadarHistory_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpsRadarHistory'
  }],
  salesRadarHistory_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesRadarHistory'
  }]
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

const DeletedUserLog = mongoose.model('deletedUserLog', deletedUserLogSchema, 'deletedUserLog');


export default DeletedUserLog;
