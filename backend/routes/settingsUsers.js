import express from 'express';
import User from '../models/User.js'; // Adjust the path as needed
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

import multer from 'multer';
import path from 'path'; // Import the path module
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';



import LoginUsers from '../models/LoginUsers.js'; 
import Organization from '../models/Organization.js';
import VesselLimit from '../models/VesselLimit.js';
import UserCounter from '../models/UserCounter.js';
import LoginCounter from '../models/LoginCounter.js';
import RolePermission from '../models/RolePermission.js';
import AisSatPull from '../models/AisSatPull.js';
import OrgCounter from '../models/OrgCounter.js';





import OpsRadar from '../models/OpsRadar.js';
import OpsRadarHistory from '../models/OpsRadarHistory.js';
import SalesRadar from '../models/SalesRadar.js';
import SalesRadarHistory from '../models/SalesRadarHistory.js';



import TrackedVesselByUser from '../models/TrackedVesselByUser.js';
import TrackedVessel from '../models/TrackedVessel.js';


import OrganizationHistory from '../models/OrganizationHistory.js';

import LoginUserHistory from '../models/LoginUserHistory.js';
import TrackedVesselByUserHistory from '../models/TrackedVesselByUserHistory.js';

import DeletedUserLog from '../models/DeletedUserLog.js';
import DeletedOrganizationLog from '../models/DeletedOrganizationLog.js';

const router = express.Router();


import jwt from 'jsonwebtoken';


const internalURL = process.env.REACT_APP_API_BASE_URL_FOR_INTERNAL ;


const encryptionKey = 'mysecretkey';

// Helper to encrypt data
const encryptData = (data) => CryptoJS.AES.encrypt(data, encryptionKey).toString();

const decryptData = (encryptedData) => {
  try {
    // console.log('Attempting to decrypt:', encryptedData); // Log the encrypted data
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('Decrypted data:', decrypted ? decrypted : 'Unable to decrypt');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};




// Function to get the next sequence number for orgId
const getNextSequence = async (seqName) => {
  const sequenceDocument = await OrgCounter.findByIdAndUpdate(
    { _id: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if it doesn't exist
  );

  return sequenceDocument.seq;
};

// Function to reset the counter to start from 555
const resetCounter = async () => {
  await OrgCounter.findByIdAndUpdate(
    { _id: 'orgId' },
    { seq: 555 },
    { upsert: true }
  );
};



const sendLoginEmail = async (adminEmail, password) => {
  try {
    const token = jwt.sign({ email: adminEmail }, encryptionKey, { expiresIn: '1h' }); // Generate a token

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: 'admin@hylapps.com',
        pass: 'ngsl cgmz pnmt uiux',
      },
    });

    const mailOptions = {
      from: 'admin@hylapps.com',
      to: adminEmail,
      subject: 'Your Organization Admin Account Details',
      text: `Welcome! Your account has been created.
Email: ${adminEmail}
Temporary Password: ${password}

URL Link to GreenHyla: ${internalURL}

Thank You,
HYLA Admin
`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Login email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

 // Function to send email with login details and reset token
 const sendUserLoginEmail = async (adminEmail, password) => {
  try {
    console.log(password);
    const token = jwt.sign({ email: adminEmail }, encryptionKey, { expiresIn: '1h' }); // Generate a token

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: 'admin@hylapps.com',
        pass: 'ngsl cgmz pnmt uiux',
      },
    });

    const mailOptions = {
      from: 'admin@hylapps.com',
      to: adminEmail,
      subject: 'Your GreenHyla Account Details',
      text: `Welcome! Your account has been created. 
Email: ${adminEmail}
Temporary Password: ${password}
  
URL Link to GreenHyla: ${internalURL}

Thank You,
HYLA Admin`,
    };
  
    await transporter.sendMail(mailOptions);
    console.log('Login email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

router.get('/all-user-roles', async (req, res) => {
    try {
      const [loginUsers, organizations, guestSetting] = await Promise.all([
        LoginUsers.find().select('-password -alerts -permissions'),
        Organization.find(),
        VesselLimit.findOne({ key: 'guestVesselLimit' }),
      ]);
  
      const guestVesselLimit = guestSetting?.value ?? null;
  
      const orgById = new Map();
      for (const org of organizations) {
        orgById.set(org._id.toString(), org);
      }
  
      const organizationsMap = {};
      const guests = [];
  
      for (const user of loginUsers) {
        const {
          _id,
          role,
          email,
          loginUserId,
          firstName = '',
          lastName = '',
          orgRef,
          active,
        } = user;
  
        if (!email || !loginUserId || role === 'hyla admin') continue;
  
        const normalizedEmail = email.trim().toLowerCase();
        const org = orgRef ? orgById.get(orgRef.toString()) : null;
  
        const userObj = {
          _id,
          loginUserId,
          userEmail: normalizedEmail,
          userFirstName: firstName,
          userLastName: lastName,
          orgRef: orgRef,
          active,
        };
  
        if (role === 'organization admin') {
          if (org?.orgId) {
            if (!organizationsMap[org.orgId]) {
              organizationsMap[org.orgId] = {
                _id: org._id,
                ...org._doc,
                organizationAdmin: userObj,
                organizationalUsers: [],
              };
            } else {
              organizationsMap[org.orgId].organizationAdmin = userObj;
            }
          }
        } else if (role === 'organizational user') {
          if (org?.orgId) {
            if (!organizationsMap[org.orgId]) {
              organizationsMap[org.orgId] = {
                _id: org._id,
                ...org._doc,
                organizationAdmin: null,
                organizationalUsers: [],
              };
            }
            organizationsMap[org.orgId].organizationalUsers.push(userObj);
          }
        } else if (role === 'guest') {
          guests.push({
            ...userObj,
            vesselLimit: guestVesselLimit,
          });
        }
      }
  
      res.json({
        organizations: Object.values(organizationsMap),
        guests,
      });
  
    } catch (err) {
      console.error('Error in /api/all-user-roles:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/create-organization', async (req, res) => {
    const {companyTitle, companyName, address, vesselLimit, adminFirstName, adminLastName, adminEmail, adminContactNumber } = req.body;
  
    if (!companyTitle || !companyName  || !vesselLimit || !adminFirstName || !adminLastName || !adminEmail || !adminContactNumber ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

 

    const session = await Organization.startSession();
    session.startTransaction();
  
    try {

       // Check if adminEmail already exists in LoginUsers
const existingUser = await LoginUsers.findOne({ email: adminEmail }).session(session);
if (existingUser) {
  throw new Error('Admin email is already in use.');
}
      const organizationCount = await Organization.countDocuments().session(session);
      if (organizationCount === 0) {
        await resetCounter();
      }
  
      const loginCounter = await LoginCounter.findOneAndUpdate(
        {},
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session }
      );
  
     
  
    
  
      const orgseq = await getNextSequence('orgId') ;
      const orgId = `ORG${orgseq}`;
  
      const loginUserId = `HYLA${loginCounter.seq}_${orgId}_ADMIN`;
  
      const newOrganization = new Organization({
        orgId,
        companyTitle,
        companyName,
        address,
        vesselLimit,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminContactNumber
      });
  
      await newOrganization.save({ session });
  
      const hashedPassword = CryptoJS.SHA256(adminContactNumber).toString();
  
   // Fetch rolePermissionRef from RolePermission collection
  const rolePermissionDoc = await RolePermission.findOne({ role: 'organization admin' }).session(session);
  
  const adminUser = new LoginUsers({
    loginUserId,
    role: 'organization admin',
    email: adminEmail,
    password: hashedPassword,
    firstName: adminFirstName,
    lastName: adminLastName,
    orgRef: newOrganization._id,
    rolePermissionRef: rolePermissionDoc?._id || null
  });
  
  
      await adminUser.save({ session });
      await sendLoginEmail(adminEmail, adminContactNumber);
  
  
      // Create AisSatPull record
      const newAisSatPull = new AisSatPull({
        orgObjectId: newOrganization._id,  // Linking to the new organization's ID
        orgId: newOrganization.orgId,      // Save orgId for reference
        companyName: newOrganization.companyName,  // Use company name from organization
        sat0 : 360 * 60000,
        sat1a : 720 * 60000,
        sat1b : 1440 * 60000
      });
  
      await newAisSatPull.save({ session });
  
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(201).json({ message: 'Organization created and email sent to admin.' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
  
      console.error('Error creating organization:', error);
      res.status(500).json({ message: 'Error creating organization or sending email.', error: error.message });
    }
  });

  router.get('/organizations', async (req, res) => {
    try {
      // Fetch all organizations with selected fields only
      const organizations = await Organization.find()
        .select('_id orgId companyTitle companyName');  // Select specific fields
  
      // If no organizations found, return a message
      if (organizations.length === 0) {
        return res.status(404).json({ message: 'No organizations found' });
      }
  
      // Return the list of organizations
      res.status(200).json({ organizations });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/update-org/:orgId', async (req, res) => {
    const { orgId } = req.params; // Use orgId from the URL params
    const { companyTitle, companyName, address, vesselLimit } = req.body;
    
    try {
      const updatedOrganization = await Organization.findOneAndUpdate(
        { orgId }, // Match based on the orgId instead of MongoDB _id
        { companyTitle, companyName, address, vesselLimit },
        { new: true } // Return the updated document
      );
  
      if (!updatedOrganization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
  
      res.json(updatedOrganization); // Return the updated organization
    } catch (err) {
      res.status(500).json({ message: 'Error updating organization', error: err.message });
    }
  });


  router.delete('/delete-org/:orgObjectId', async (req, res) => {
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { orgObjectId } = req.params;
      const { deletedBy } = req.body;
      if (!orgObjectId || !deletedBy) {
        return res.status(400).json({ message: "Missing orgId or deletedBy" });
      }
  
      // 1. Archive Organization
      const org = await Organization.findById(orgObjectId).session(session);
      if (!org) return res.status(404).json({ message: `Organization not found with ID ${orgObjectId}` });
  
      const [orgHistory] = await OrganizationHistory.create([{
        ...org.toObject(),
        deletedAt: new Date(),
        deletedBy
      }], { session });
  
      // 2. Get login users
     
      const loginUsers = await LoginUsers.find({ orgRef: org._id }).session(session);
  
  
      const loginUserIdMap = {};
      loginUsers.forEach(user => {
        loginUserIdMap[user.loginUserId] = user.role;
      });
  
      const loginUserIds = loginUsers.map(lu => lu.loginUserId);
  
     
  
      // 3. Archive  LoginUsers
     
  
      const insertedLoginUserHistory = await LoginUserHistory.insertMany(
        loginUsers.map(lu => ({
          ...lu.toObject(),
          deletedAt: new Date(),
          deletedBy,
          orgDeleted: true
        })), { session }
      );
  
      // 4. Delete loginUsers
      const loginUserDeleteResult = await LoginUsers.deleteMany({ loginUserId: { $in: loginUserIds } }).session(session);
  
      // 5. TrackedVesselByUser
      const trackedDocs = await TrackedVesselByUser.find({ loginUserId: { $in: loginUserIds } }).session(session);
  
      const insertedTrackedVesselsHistory = await TrackedVesselByUserHistory.insertMany(
        trackedDocs.map(d => ({
          ...d.toObject(),
          userDeleted: true,
          deletedAt: new Date(),
          deletedBy
        })), { session }
      );
  
      const trackedVesselDeleteResult = await TrackedVesselByUser.deleteMany({ loginUserId: { $in: loginUserIds } }).session(session);
  
      // TrackedVessel orphan cleanup
      const imoValues = [...new Set(trackedDocs.map(doc => doc.IMO))];
      const stillTrackedIMOs = await TrackedVesselByUser.find({ IMO: { $in: imoValues } }).distinct('IMO').session(session);
      const imosToDelete = imoValues.filter(imo => !stillTrackedIMOs.includes(imo));
      let trackedVesselDeletedCount = 0;
      if (imosToDelete.length) {
        trackedVesselDeletedCount = (await TrackedVessel.deleteMany({ IMO: { $in: imosToDelete } }).session(session)).deletedCount;
      }
  
      // 7. Archive and delete OpsRadar and SalesRadar
      const opsDocs = await OpsRadar.find({ loginUserId: { $in: loginUserIds } }).session(session);
      const salesDocs = await SalesRadar.find({ loginUserId: { $in: loginUserIds } }).session(session);
  
      const insertedOpsHistory = await OpsRadarHistory.insertMany(
        opsDocs.map(doc => ({
          ...doc.toObject(),
          userDeleted: true,
          deletedAt: new Date(),
          deletedBy
        })), { session }
      );
  
      const insertedSalesHistory = await SalesRadarHistory.insertMany(
        salesDocs.map(doc => ({
          ...doc.toObject(),
          userDeleted: true,
          deletedAt: new Date(),
          deletedBy
        })), { session }
      );
  
      const opsRadarDeleteResult = await OpsRadar.deleteMany({ loginUserId: { $in: loginUserIds } }).session(session);
      const salesRadarDeleteResult = await SalesRadar.deleteMany({ loginUserId: { $in: loginUserIds } }).session(session);
  
      // 8. Create DeletedUserLog
      const deletedUserLogsData = [];
  
      for (const lu of loginUsers) {
        const role = lu.role;
        const loginUserHistory = insertedLoginUserHistory.find(l => l.loginUserId === lu.loginUserId);
       
  
        const trackedVesselHistories = insertedTrackedVesselsHistory.filter(h => h.loginUserId === lu.loginUserId);
        const opsHistories = insertedOpsHistory.filter(h => h.loginUserId === lu.loginUserId);
        const salesHistories = insertedSalesHistory.filter(h => h.loginUserId === lu.loginUserId);
  
        deletedUserLogsData.push({
          deletedAt: new Date(),
          performedBy: deletedBy,
          role,
         
          loginUserId: lu.loginUserId,
          loginUserHistory_id: loginUserHistory?._id || null,
          trackedVesselByUser: trackedVesselHistories.map(h => ({
            trackedVesselByUserHistory_id: h._id,
            IMO: h.IMO,
            AddedDate: h.AddedDate
          })),
          opsRadarHistory_ids: opsHistories.map(h => h._id),
          salesRadarHistory_ids: salesHistories.map(h => h._id)
        });
      }
  
      const insertedDeletedUserLogs = await DeletedUserLog.insertMany(deletedUserLogsData, { session });
  
      // 9. Create DeletedOrganizationLog
      const orgAdmins = insertedDeletedUserLogs.filter(l => l.role === 'organization admin').map(l => l._id);
      const orgUsers = insertedDeletedUserLogs.filter(l => l.role === 'organizational user').map(l => l._id);
  
      await DeletedOrganizationLog.create([{
        deletedAt: new Date(),
        performedBy: deletedBy,
        organizationHistory_id: orgHistory._id,
        deletedUserLog_ids: {
          orgAdmins,
          orgUsers
        }
      }], { session });
  
      // 10. Final organization delete
      await Organization.deleteOne({ _id: org._id }).session(session);
  
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({
        message: "Organization and all associated users deleted successfully.",
        deletedCounts: {
          organization: 1,
         
          loginUsers: loginUserDeleteResult.deletedCount,
          trackedVesselByUser: trackedVesselDeleteResult.deletedCount,
          trackedVessel: trackedVesselDeletedCount,
          opsRadar: opsRadarDeleteResult.deletedCount,
          salesRadar: salesRadarDeleteResult.deletedCount
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error deleting organization:", error);
      res.status(500).json({ message: "Error deleting organization", error: error.message });
    }
  });
  

  
      
    router.post('/create-user', async (req, res) => {
      try {
  
        const { userType, firstName, lastName, email, orgId } = req.body;

         // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'All fields are required to fill.' });
    }

       // Parallelize counters
    const [userCounter, loginCounter] = await Promise.all([
      UserCounter.findOneAndUpdate({}, { $inc: { userId: 1 } }, { new: true, upsert: true }),
      LoginCounter.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true })
    ]);

    
      
        let loginUserId;
  
        // Determine loginUserId based on userType
        if (req.body.userType === 'hyla admin') {
          loginUserId = `HYLA${loginCounter.seq}`;
        } else if (req.body.userType === 'organizational user' && req.body.orgId) {
          loginUserId = `HYLA${loginCounter.seq}_${req.body.orgId}`;
        } else if (req.body.userType === 'guest') {
          loginUserId = `HYLA${loginCounter.seq}_GUEST${userCounter.userId}`;
        }
    
        // Function to generate a random alphanumeric string
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  const randomPassword = generateRandomString(10);
  console.log(randomPassword);
  const hashedPassword = CryptoJS.SHA256(randomPassword).toString();
    
     let orgRef = null;
    // If it's an organizational user, find the organization by orgId
    if (userType === 'organizational user' && orgId) {
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found.' });
      }
      orgRef = organization._id;  // Set orgRef to the ObjectId of the found organization
    }


     // Fetch the rolePermissionRef based on the userType
     let rolePermissionRef = null;
     if (userType === 'organizational user') {
       // Find the permission for organizational user
       rolePermissionRef = await RolePermission.findOne({ role: 'organizational user' });
     } else  if (userType === 'guest') {
      // Find the permission for organizational user
      rolePermissionRef = await RolePermission.findOne({ role: 'guest' });
    }
 
     if (!rolePermissionRef) {
       return res.status(400).json({ message: 'No role permission found for the provided role.' });
     }

    
    // Create new user data
    const newUserData = {
      loginUserId,
      role: userType,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      orgRef,  // orgRef is populated for organization-related users
      rolePermissionRef: rolePermissionRef._id,  // Store the _id of the role permission
    };
    
    const newUser = new LoginUsers(newUserData);

    // Save the user and send email
    await newUser.save();
  
        // await sendLoginEmail(decryptData(newUser.userEmail), randomtext);
        await sendUserLoginEmail(newUser.email, randomPassword);
    
        res.status(201).json({ message: 'User created and email sent successfully', user: newUser });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern.email) {
          // Handle duplicate email error
          res.status(400).json({ message: 'Email already exists!' });
        } else {
          // Handle other errors
          res.status(500).json({ message: 'Error creating User or sending email.', error: error.message });
        }
      }
    });

    // Check if email already exists
router.get('/users/check-email', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await LoginUsers.findOne({ email });
    if (user) {
      return res.json({ exists: true });
    }
    return res.json({ exists: false });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking email', error: error.message });
  }
});

// Update user details
router.put('/edit-user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, isAdmin } = req.body;

  try {
    const user = await LoginUsers.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for email conflict (if email is changed)
    if (email !== user.email) {
      const emailTaken = await LoginUsers.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update LoginUsers document
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    const updatedUser = await user.save();

    // If the user is an admin, update the organization as well
    if (isAdmin && user.orgRef) {
      const updatedOrg = await Organization.findByIdAndUpdate(
        user.orgRef,
        {
          adminFirstName: firstName,
          adminLastName: lastName,
          adminEmail: email,
        },
        { new: true }
      );

      if (!updatedOrg) {
        return res.status(404).json({ message: 'Organization not found' });
      }
    }

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    });
  }
});


router.delete('/delete-user', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Ensure all deletions are atomic

  try {
    const { userEmail, deletedBy  } = req.body;

    if (!userEmail ) {
      return res.status(400).json({ message: "Missing userEmail." });
    }
    if (!deletedBy) {
      return res.status(400).json({ message: "Missing email of who is deleting." });
    }


    // Step 2: Find and delete user from LoginUsers collection
    const loginUser = await LoginUsers.findOne({ email: userEmail }).session(session);
    if (!loginUser) {
      return res.status(404).json({ message: "User not found in LoginUsers" });
    }
    const loginUserId = loginUser.loginUserId;
    const insertedLoginUserHistory = await LoginUserHistory.create([{
      ...loginUser.toObject(),
      deletedAt: new Date(),
      deletedBy,
    }], { session });
    const loginUserDeleteResult = await LoginUsers.deleteOne({ email: userEmail }).session(session);
    console.log(`LoginUsers collection: ${loginUserDeleteResult.deletedCount} document(s) deleted`);

    // Step 3: Find and delete user's tracked vessels
    const trackedVessels = await TrackedVesselByUser.find({ loginUserId, email: userEmail }).session(session);
    const imoValues = [...new Set(trackedVessels.map(doc => doc.IMO))]; // Unique IMO values
    const trackedVesselDeleteResult = await TrackedVesselByUser.deleteMany({ loginUserId, email: userEmail }).session(session);
    console.log(`TrackedVesselByUser collection: ${trackedVesselDeleteResult.deletedCount} document(s) deleted`);
      // Insert into history
      const trackedVesselsHistory = trackedVessels.map(doc => ({
        ...doc.toObject(),
        userDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      }));
      const insertedTrackedVesselsHistory = await TrackedVesselByUserHistory.insertMany(trackedVesselsHistory, { session });

    // Step 4: Check if any IMO values are still tracked
    const stillTrackedIMOs = await TrackedVesselByUser.find({ IMO: { $in: imoValues } }).distinct("IMO").session(session);
    const imosToDelete = imoValues.filter(imo => !stillTrackedIMOs.includes(imo));

    // Step 5: Delete from TrackedVessel if not tracked by anyone
    let trackedVesselDeletedCount = 0;
    if (imosToDelete.length > 0) {
      const trackedVesselDeleteResult =  await TrackedVessel.deleteMany({ IMO: { $in: imosToDelete } }).session(session);
      trackedVesselDeletedCount = trackedVesselDeleteResult.deletedCount;
    }
    console.log(`TrackedVessel collection: ${trackedVesselDeletedCount} document(s) deleted`);

    // Step 6: Delete user's data from OpsRadar
    const opsDocs = await OpsRadar.find({ loginUserId }).session(session);
    const opsRadarDeleteResult = await OpsRadar.deleteMany({ loginUserId }).session(session);
    console.log(`OpsRadar collection: ${opsRadarDeleteResult.deletedCount} document(s) deleted`);
    const opsRadarHistoryDocs = opsDocs.map(doc => ({
      ...doc.toObject(),
      userDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    }));
    const insertedOpsHistory = await OpsRadarHistory.insertMany(opsRadarHistoryDocs, { session });

    // Step 7: Delete user's data from SalesRadar
    const salesDocs = await SalesRadar.find({ loginUserId }).session(session);
    const salesRadarDeleteResult = await SalesRadar.deleteMany({ loginUserId }).session(session);
    console.log(`SalesRadar collection: ${salesRadarDeleteResult.deletedCount} document(s) deleted`);
    const salesRadarHistoryDocs = salesDocs.map(doc => ({
      ...doc.toObject(),
      userDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    }));
    const insertedSalesHistory = await SalesRadarHistory.insertMany(salesRadarHistoryDocs, { session });

     // Step 8: DeletedUserLog
     await DeletedUserLog.create([{
      deletedAt: new Date(),
      performedBy: deletedBy,
      role: loginUser.role,
      loginUserId: loginUser.loginUserId,
  
      loginUserHistory_id: insertedLoginUserHistory[0]._id,
      trackedVesselByUser: insertedTrackedVesselsHistory.map(doc => ({
        trackedVesselByUserHistory_id: doc._id,
        IMO: doc.IMO,
        AddedDate: doc.AddedDate
      })),
      opsRadarHistory_ids: insertedOpsHistory.map(doc => doc._id),
      salesRadarHistory_ids: insertedSalesHistory.map(doc => doc._id),
    }], { session });
    

    await session.commitTransaction(); // Commit transaction
    session.endSession();

    res.status(200).json({ 
      message: "User and related data deleted successfully",
      deletedCounts: {
     
        loginUser: loginUserDeleteResult.deletedCount,
        trackedVesselByUser: trackedVesselDeleteResult.deletedCount,
        trackedVessel: trackedVesselDeletedCount,
        opsRadar: opsRadarDeleteResult.deletedCount,
        salesRadar: salesRadarDeleteResult.deletedCount
      }
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback in case of failure
    session.endSession();
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});


router.get('/guest-vessel-limit', async (req, res) => {
  try {
    const limitDoc = await VesselLimit.findOne({ key: 'guestVesselLimit' });
    if (!limitDoc) {
      return res.status(404).json({ message: 'Guest vessel limit not found.' });
    }
    res.status(200).json({ vesselLimit: limitDoc.value });
  } catch (error) {
    console.error('Error fetching guest vessel limit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/update-guest-vessel-limit', async (req, res) => {
  const { value } = req.body;
  try {
    const result = await VesselLimit.findOneAndUpdate(
      { key: 'guestVesselLimit' },
      { value },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Updated', vesselLimit: result.value });
  } catch (error) {
    console.error('Error updating guest vessel limit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/org-status/:orgId', async (req, res) => {
  const { orgId } = req.params;
  const { active } = req.body;

  try {
    const org = await Organization.findOne({ orgId });
    if (!org) return res.status(404).send('Organization not found');

    // Update organization status (you can add `active` field to your org schema if needed)
    await Organization.updateOne({ orgId }, { $set: { active } }); // Optional if you plan to store org status

    // Find all users (admin + users) under this org
    const orgUsers = await LoginUsers.find({ orgRef: org._id });

    const bulkUpdates = [];

    if (!active) {
      // 🔴 DEACTIVATE org + admin + users
      orgUsers.forEach((user) => {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { active: false } },
          },
        });
      });
    } else {
      // 🟢 ACTIVATE org + ONLY admin
      orgUsers.forEach((user) => {
        if (user.role === 'organization admin') {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: user._id },
              update: { $set: { active: true } },
            },
          });
        }
      });
    }

    if (bulkUpdates.length > 0) {
      await LoginUsers.bulkWrite(bulkUpdates);
    }

    res.send({ success: true });
  } catch (err) {
    console.error('Error toggling org status:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/user-status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { active } = req.body;

  try {
    const user = await LoginUsers.findOne({ loginUserId: userId });
    if (!user) return res.status(404).send('User not found');

    // Optional: guard clause to prevent direct admin deactivation
    if (user.role === 'organization admin') {
      return res.status(403).send('Admin activation toggle is disabled');
    }

    user.active = active;
    await user.save();

    res.send({ success: true });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).send('Internal Server Error');
  }
});


export default router; 
