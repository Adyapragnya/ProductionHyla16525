import express from "express";
import LoginUsers from "../models/LoginUsers.js";
import RolePermission from "../models/RolePermission.js";
import Organization from "../models/Organization.js";
import _ from 'lodash'; // for deep merging (you can also use deepmerge or manually merge)
const router = express.Router();


router.get("/user-permissions/:userId", async (req, res) => {
  const { userId } = req.params;
  // const { checkAllUsers} = req.body;


  try {
    const user = await LoginUsers.findOne({ loginUserId: userId }).lean();
    // if(checkAllUsers){

    // }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let finalPermissions = {
      modulePermissions: {},
      functionalityPermissions: {}
    };

    // Step 1: Load role-based permissions
    let rolePermissionsDoc = null;
    if (user.rolePermissionRef) {
      rolePermissionsDoc = await RolePermission.findById(user.rolePermissionRef).lean();
    } else if (user.role) {
      rolePermissionsDoc = await RolePermission.findOne({ role: user.role }).lean();
    }

    if (rolePermissionsDoc?.permissions) {
      finalPermissions = _.cloneDeep(rolePermissionsDoc.permissions); // deep clone to avoid mutating DB object
    }

    // Step 2: Merge user-specific overrides (if any)
    if (user.permissions) {
      // Merge module permissions
      if (user.permissions.modulePermissions) {
        finalPermissions.modulePermissions = {
          ...finalPermissions.modulePermissions,
          ...user.permissions.modulePermissions
        };
      }

      // Merge functionality permissions
      if (user.permissions.functionalityPermissions) {
        for (const [func, funcPerm] of user.permissions.functionalityPermissions.entries()) {
          if (!finalPermissions.functionalityPermissions[func]) {
            finalPermissions.functionalityPermissions[func] = { actions: {} };
          }

          finalPermissions.functionalityPermissions[func].actions = {
            ...finalPermissions.functionalityPermissions[func].actions,
            ...funcPerm.actions
          };
        }
      }
    }

    return res.json({ permissions: finalPermissions });

  } catch (err) {
    console.error("Error fetching permissions:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// router.get("/all-user-permissions", async (req, res) => {
//   try {
//     const users = await LoginUsers.find().lean();
//     const organizations = await Organization.find({}, "orgId companyTitle").lean();

//     const orgMap = organizations.reduce((acc, org) => {
//       if (org.orgId) acc[org.orgId.trim().toUpperCase()] = org.companyTitle;
//       return acc;
//     }, {});
    
//     const allUserPermissions = [];

//     for (const user of users) {
//       let finalPermissions = {
//         modulePermissions: {},
//         functionalityPermissions: {},
//       };

//       // Load role-based permissions
//       let rolePermissionsDoc = null;
//       if (user.rolePermissionRef) {
//         rolePermissionsDoc = await RolePermission.findById(user.rolePermissionRef).lean();
//       } else if (user.role) {
//         rolePermissionsDoc = await RolePermission.findOne({ role: user.role }).lean();
//       }

//       if (rolePermissionsDoc?.permissions) {
//         finalPermissions = _.cloneDeep(rolePermissionsDoc.permissions);
//       }

//       // Merge user-specific overrides
//       if (user.permissions) {
//         if (user.permissions.modulePermissions) {
//           finalPermissions.modulePermissions = {
//             ...finalPermissions.modulePermissions,
//             ...user.permissions.modulePermissions,
//           };
//         }

//         if (user.permissions.functionalityPermissions) {
//           for (const [func, funcPerm] of Object.entries(user.permissions.functionalityPermissions)) {
//             if (!finalPermissions.functionalityPermissions[func]) {
//               finalPermissions.functionalityPermissions[func] = { actions: {} };
//             }

//             finalPermissions.functionalityPermissions[func].actions = {
//               ...finalPermissions.functionalityPermissions[func].actions,
//               ...funcPerm.actions,
//             };
//           }
//         }
//       }

//       // Extract orgId from loginUserId
//    // Extract orgId from loginUserId
// let orgId = null;
// if (user.loginUserId) {
//   const parts = user.loginUserId.split("_");
//   if (parts.length >= 2) {
//     orgId = parts[1]; // Always use the second part
//   }
// }


//       allUserPermissions.push({
//         userId: user.loginUserId,
//         email: user.email,
//         role: user.role,
//         orgId,
//         companyTitle: orgId && orgMap[orgId] ? orgMap[orgId] : null,
//         permissions: finalPermissions,
//       });
//     }

//     return res.json({ users: allUserPermissions });

//   } catch (err) {
//     console.error("Error fetching all user permissions:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });


router.get("/all-user-permissions", async (req, res) => {
  try {
    const [users, organizations, rolePermissions] = await Promise.all([
      LoginUsers.find().lean(),
      Organization.find({}, "orgId companyTitle").lean(),
      RolePermission.find().lean()
    ]);

    const orgMap = organizations.reduce((acc, org) => {
      if (org.orgId) acc[org.orgId.trim().toUpperCase()] = org.companyTitle;
      return acc;
    }, {});

    const rolePermissionsMap = rolePermissions.reduce((acc, perm) => {
      if (perm._id) acc[perm._id.toString()] = perm;
      if (perm.role) acc[perm.role] = perm;
      return acc;
    }, {});

    const allUserPermissions = await Promise.all(users.map(async (user) => {
      let finalPermissions = {
        modulePermissions: {},
        functionalityPermissions: {},
      };

      let rolePermissionsDoc = null;
      if (user.rolePermissionRef) {
        rolePermissionsDoc = rolePermissionsMap[user.rolePermissionRef.toString()];
      } else if (user.role) {
        rolePermissionsDoc = rolePermissionsMap[user.role];
      }

      if (rolePermissionsDoc?.permissions) {
        finalPermissions = _.cloneDeep(rolePermissionsDoc.permissions);
      }

      if (user.permissions) {
        if (user.permissions.modulePermissions) {
          finalPermissions.modulePermissions = {
            ...finalPermissions.modulePermissions,
            ...user.permissions.modulePermissions,
          };
        }

        if (user.permissions.functionalityPermissions) {
          for (const [func, funcPerm] of Object.entries(user.permissions.functionalityPermissions)) {
            if (!finalPermissions.functionalityPermissions[func]) {
              finalPermissions.functionalityPermissions[func] = { actions: {} };
            }

            finalPermissions.functionalityPermissions[func].actions = {
              ...finalPermissions.functionalityPermissions[func].actions,
              ...funcPerm.actions,
            };
          }
        }
      }

      let orgId = null;
      if (user.loginUserId) {
        const parts = user.loginUserId.split("_");
        if (parts.length >= 2) orgId = parts[1];
      }

      return {
        userId: user.loginUserId,
        email: user.email,
        role: user.role,
        orgId,
        companyTitle: orgId && orgMap[orgId] ? orgMap[orgId] : null,
        permissions: finalPermissions,
      };
    }));

    return res.json({ users: allUserPermissions });

  } catch (err) {
    console.error("Error fetching all user permissions:", err);
    return res.status(500).json({ message: "Server error" });
  }
});



router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find().select(' orgId companyTitle');
    res.status(200).json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/update-user-permissions/:userId

router.put("/update-user-permissions/:userId", async (req, res) => {
  const { userId } = req.params;
  const { modulePermissions } = req.body;

  if (!modulePermissions || typeof modulePermissions !== 'object') {
    return res.status(400).json({ message: "Invalid module permissions format." });
  }

  try {
    const user = await LoginUsers.findOne({ loginUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔄 Ensure modulePermissions is a plain object (not Mongoose Map or other reactive structure)
    const plainModulePermissions = JSON.parse(JSON.stringify(modulePermissions));

    user.permissions = {
      ...user.permissions,
      modulePermissions: {
        ...Object.fromEntries(user.permissions?.modulePermissions || []),
        ...plainModulePermissions
      }
    };

    await user.save();

    res.json({ message: "User module permission overrides updated." });
  } catch (error) {
    console.error("Error updating module permissions:", error);
    res.status(500).json({ message: "Server error while saving module permissions." });
  }
});

// alerts

router.get('/user-alerts/get-overview', async (req, res) => {
  try {
    const users = await LoginUsers.find({}, {
      loginUserId: 1,
      role: 1,
      email: 1,
      alerts: 1
    }).lean(); // lean() gives plain JS objects

    const enrichedUsers = await Promise.all(users.map(async user => {
      // Extract orgId from loginUserId
      const orgId = user.loginUserId.includes('_')
        ? user.loginUserId.split('_')[1]
        : user.loginUserId.split('_')[0];

      // Only fetch organization for relevant roles
      let organization = null;
      if (["organization admin", "organizational user"].includes(user.role)) {
        organization = await Organization.findOne({ orgId }).lean();
      }

      return {
        loginUserId: user.loginUserId,
        email: user.email,
        role: user.role,
        alerts: user.alerts,
        organizationName: organization?.companyName || null
      };
    }));

    res.status(200).json(enrichedUsers);
  } catch (err) {
    console.error('Error fetching user alerts:', err);
    res.status(500).json({ message: 'Failed to retrieve user alerts' });
  }
});

// Update user alerts
router.put('/user-alerts/update', async (req, res) => {
  const { loginUserId, alerts } = req.body; // Expecting loginUserId and alerts in the request body

  if (!loginUserId || !alerts) {
    return res.status(400).json({ message: 'Missing required fields: loginUserId or alerts' });
  }

  try {
    // Find the user by loginUserId
    const user = await LoginUsers.findOne({ loginUserId }).exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's alerts
    user.alerts = { ...user.alerts, ...alerts };

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'User alerts updated successfully' });
  } catch (err) {
    console.error('Error updating user alerts:', err);
    res.status(500).json({ message: 'Failed to update user alerts' });
  }
});

export default router;
