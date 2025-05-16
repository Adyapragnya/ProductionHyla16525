import mongoose from 'mongoose';

const userEmailLogSchema = new mongoose.Schema({
  loginUserId: {
    type: String,
   
  },

  role: {
    type: String,
    enum: ['hyla admin', 'guest', 'organization'],
    required: true
  },

  orgRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: function () {
      return ['organization'].includes(this.role);
    }
  },

  orgId: {
    type: String,
    required: function () {
      return ['organization'].includes(this.role);
    }
  },

  lastSentAt: {
    type: Date,
    default: null
  },

  emailLog: [
    {
      type: {
        type: String,
        enum: ['entry', 'exit', 'custom'],
        required: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      IMO: {
        type: Number,
        required: true
      },
      geofence: {
        geofenceRef: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        geofenceType: {
          type: String,
          enum: ['Polygon', 'Polycircle', 'Polyline', 'Advanced'],
          required: true
        },

      },
       eventTimestamp: { // The actual timestamp of when the event (entry/exit) happened
        type: Date,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

const UserEmailLog = mongoose.model('userEmailLog', userEmailLogSchema, 'userEmailLog');

export default UserEmailLog;
