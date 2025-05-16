// models/RolePermission.js
import mongoose from 'mongoose';

const RolePermissionSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },


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
      required: true 
    }
});

const RolePermission =  mongoose.model('rolePermission', RolePermissionSchema, 'rolePermission');
export default RolePermission;
