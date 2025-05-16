import mongoose from 'mongoose';

const LoginUserHistorySchema = new mongoose.Schema({
  loginUserId: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    orgRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organizations',
      validate: {
        validator: function (value) {
          // If role is 'organization admin' or 'organizational user', orgRef must be provided
          const requiredRoles = ['organization admin', 'organizational user'];
          return !requiredRoles.includes(this.role) || (value != null);
        },
        message: 'orgRef is required for organization admin and organizational user roles'
      }
    },
  
      // Reference to RolePermission (optional but useful)
      rolePermissionRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rolePermission',
        required: false // fallback to `role` lookup if not provided
      },
    // Optional Nested Permissions Object
    permissions: {
      type: new mongoose.Schema({
        modulePermissions: {
          type: Map,
          of: Boolean // e.g., { dashboard: true, analytics: false }
        },
        functionalityPermissions: {
          type: Map,
          of: new mongoose.Schema({
            actions: {
              type: Map,
              of: Boolean // e.g., { add: true, delete: false }
            }
          }, { _id: false })
        }
      }, { _id: false }),
      required: false // <-- makes the entire permissions object optional
    },
  
    alerts: {
      type: new mongoose.Schema({
        customAlertCreate: { type: Boolean, default: false },
        geofenceAlerts: { type: Boolean, default: false },
        customAlerts: { type: Boolean, default: false }
      }, { _id: false }),
      default: () => ({}) // ensure default structure is set
    },
    
  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: String },
  orgDeleted: { type: Boolean, default: false }
  
 
}, { timestamps: true });


const LoginUserHistory = mongoose.model('loginUserHistory', LoginUserHistorySchema, 'loginUserHistory');

export default LoginUserHistory;
