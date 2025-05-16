import express from 'express';
import User from '../models/User.js'; // Adjust the path as needed
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import LoginUsers from '../models/LoginUsers.js'; 
import UserCounter from '../models/UserCounter.js';
import LoginCounter from '../models/LoginCounter.js';
import TrackedVesselByUser from '../models/TrackedVesselByUser.js';
import TrackedVessel from '../models/TrackedVessel.js';
import OpsRadar from '../models/OpsRadar.js';
import OpsRadarHistory from '../models/OpsRadarHistory.js';
import SalesRadar from '../models/SalesRadar.js';
import SalesRadarHistory from '../models/SalesRadarHistory.js';
import mongoose from 'mongoose';
import TrackedVesselByUserHistory from '../models/TrackedVesselByUserHistory.js';
import DeletedUserLog from '../models/DeletedUserLog.js';
import UserHistory from '../models/UserHistory.js';
import LoginUserHistory from '../models/LoginUserHistory.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const router = express.Router();
const encryptionKey = 'mysecretkey'; // Secret key used for encryption and decryption
const secretKey = '12345'; // Replace with your actual key

dotenv.config(); // Load environment variables from .env file

const internalURL = process.env.REACT_APP_API_BASE_URL_FOR_INTERNAL ;

const decryptData = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== "string") {
    // console.error("Invalid input for decryption:", encryptedText);
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    // if (!decryptedData) {
    //   throw new Error("Decryption resulted in empty data");
    // }

    return decryptedData;
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
};



const encryptData = (data) => {
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

// Function to send email with login details and reset token
const sendLoginEmail = async (adminEmail, password) => {
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
    
  router.post('/create', async (req, res) => {
    try {

      const userCounter = await UserCounter.findOneAndUpdate(
        {},
        { $inc: { userId: 1 } },
        { new: true, upsert: true }
      );




      const loginCounter = await LoginCounter.findOneAndUpdate(
        {},
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
    
    
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
  
      const newUserData = {
        ...req.body,
        userId: userCounter.userId,
      };
  
      // Set orgId based on user type
      if (req.body.userType === 'organizational user' && req.body.orgId) {
        newUserData.orgId = `${req.body.orgId}`;
      } else {
        newUserData.orgId = null; // Adjust as necessary
      }
  
      const newUser = new User(newUserData);
     
      const randomtext = generateRandomString(10);
      // const hashedPassword = CryptoJS.SHA256(decryptData(randomtext)).toString();
      const hashedPassword = CryptoJS.SHA256(randomtext).toString();

      const OrgUserAndGuest = new LoginUsers({
        loginUserId,
        role: newUser.userType,
        email: newUser.userEmail,
        password: hashedPassword,
      });
    
      await OrgUserAndGuest.save();
      await newUser.save();
      // await sendLoginEmail(decryptData(newUser.userEmail), randomtext);
      await sendLoginEmail(newUser.userEmail, randomtext);
  
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



 router.post('/create-guest-account', async (req, res) => {
  try {

    const userCounter = await UserCounter.findOneAndUpdate(
      {},
      { $inc: { userId: 1 } },
      { new: true, upsert: true }
    );




    const loginCounter = await LoginCounter.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
  
  
    let loginUserId;

    if (req.body.userType === 'guest') {
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

    

  

    const newUser = new User({
      userId: userCounter.userId,
      ...req.body,
     
    });
   
    const randomtext = generateRandomString(10);
    // const hashedPassword = CryptoJS.SHA256(decryptData(randomtext)).toString();
    const hashedPassword = CryptoJS.SHA256(randomtext).toString();

    const OrgUserAndGuest = new LoginUsers({
      loginUserId,
      role: newUser.userType,
      email: newUser.userEmail,
      password: hashedPassword,
    });
   
    await OrgUserAndGuest.save();
    
    await newUser.save();


    await sendLoginEmail(newUser.userEmail, randomtext);
    
    res.status(201).json({ message: 'Guest User created and email sent successfully', user: newUser });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email) {
      // Handle duplicate email error
      res.status(400).json({ message: 'Email already exists!' });
    } else {
      // Handle other errors
      res.status(500).json({ message: 'Error creating Guest User or sending email.', error: error.message });
    }
  }
});
  

// @desc Verify the password reset token
// @route GET /api/organizations/verify-token
// @access Public
router.get('/verify-token', (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    jwt.verify(token, encryptionKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      // Token is valid
      res.json({ message: 'Token is valid', email: decoded.email });
    });
  });

  router.get('/getData', async (req, res) => {
    try {
      const { role, id } = req.query; // Get role and user ID from query parameters
  
      if (!role || !id) {
        return res.status(400).json({ message: "Missing role or id parameter." });
      }
  
      let query = {}; // Default query (fetch all users)
  
      if (role === "organization admin") {
        const orgId = id.includes('_') ? id.split('_')[1] : id.split('_')[0];
        query = { orgId }; // Fetch only users in the same orgId
      } else if (role !== "hyla admin") {
        return res.status(200).json([]); // For other roles, return an empty array
      }
  
      let Users = await User.find(query); // Fetch users based on the role-based query
  
      // Decrypt necessary fields
      Users = Users.map(user => ({
        ...user._doc,
        contactEmail: decryptData(user.contactEmail),
        userEmail: user.userEmail,
      }));
  
      res.status(200).json(Users);
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
  });
  

router.delete('/delete-user', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Ensure all deletions are atomic

  try {
    const { userEmail, _id, deletedBy  } = req.body;

    if (!userEmail || !_id) {
      return res.status(400).json({ message: "Missing userEmail or userId." });
    }
    if (!deletedBy) {
      return res.status(400).json({ message: "Missing email of who is deleting." });
    }

    console.log(`Deleting user with ID: ${_id} and Email: ${userEmail}`);

    // Step 1: Find and delete user from User collection
    const userToDelete = await User.findOne({ _id }).session(session);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found in users" });
    }
    const insertedUserHistory = await UserHistory.create([{
      ...userToDelete.toObject(),
      deletedAt: new Date(),
      deletedBy,
    }], { session });
    const userDeleteResult = await User.deleteOne({ _id }).session(session);
    console.log(`users collection: ${userDeleteResult.deletedCount} document(s) deleted`);

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
      userHistory_id: userToDelete ? insertedUserHistory[0]._id : null,
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
        user: userDeleteResult.deletedCount,
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

router.get('/getData-for-setting', async (req, res) => {
  try {
  let organizations = await User.find(); // Fetch data from the database
 
  // Decrypt necessary fields for each organization
  organizations = organizations.map(org => ({
  ...org._doc,
  contactEmail: decryptData(org.contactEmail),
  userEmail: org.userEmail,
  userContactNumber: decryptData(org.userContactNumber),
  // Decrypt other fields as needed
  }));
 
  res.status(200).json(organizations);
  } catch (error) {
  res.status(500).json({ message: 'Error retrieving data', error: error.message });
  }
 });

export default router; 