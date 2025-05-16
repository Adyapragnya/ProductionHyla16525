import mongoose from 'mongoose';

const pendingEmailSchema = new mongoose.Schema({
 loginUserId: {
  type: String,
  required: function () {
    return ['hyla admin', 'guest'].includes(this.role);
  }
},

  
  role: {
    type: String,
    enum: ['hyla admin', 'guest','organization'],
    required: true
  },
  
orgRef: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'organizations',
  required: function () {
    return this.role === 'organization';
  }
},

  // orgId: {
  //   type: String,
  //   required: function () {
  //     return ['organization'].includes(this.role);
  //   }
  // },

  IMO: {
    type: Number,
    required: true
  },

  vesselName: {
      type: String,
      required: true
    }, 

  emailType: {
    type: String,
    enum: ['entry', 'exit', 'custom'],
    required: true
  },

  geofence: {
  geofenceRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  },

  geofenceName: {
      type: String,
      required: true
    },

    geofenceType: {
      type: String,
      enum: ['Polygon', 'Polycircle', 'Polyline', 'Advanced'],
      required: true
    },

    seaport: {
      type: String,
      required: true
    },
  },
  

    eventTimestamp: { // The actual timestamp of when the event (entry/exit) happened
        type: Date,
        required: true
      },

  scheduledTime: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const PendingEmail = mongoose.model('pendingEmail', pendingEmailSchema, 'pendingEmail');

export default PendingEmail;
