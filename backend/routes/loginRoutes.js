// routes/loginRoutes.js
import express from 'express';
import CryptoJS from 'crypto-js';
import LoginUsers from '../models/LoginUsers.js'; // Ensure this uses .js for ES Modules
import jwt from 'jsonwebtoken';


const router = express.Router();
const encryptionKey = 'mysecretkey'; // Your encryption key

// @desc User sign-in
// @route POST /api/organizations/signin
// @access Public
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        console.log(email);
        console.log(email.toLowerCase());

        // Convert email to lowercase to avoid case-sensitive issues
        const user = await LoginUsers.findOne({ email: email.toLowerCase() });
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: "Email does not exist" });
        }

        if (user.active === false) {
            return res.status(403).json({ message: 'Your account is deactivated. Please contact your administrator.' });
        }
        
        // Verify password
        const isPasswordValid = CryptoJS.SHA256(password).toString() === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        // Initialize adminId as null
        let adminId = null;                                                                            

        // If role is "organizational user", find AdminId
        if (user.role === 'organizational user') {
            // Extract orgId from loginUserId
            const orgId = user.loginUserId.includes('_') 
                ? user.loginUserId.split('_')[1] 
                : user.loginUserId.split('_')[0];
            console.log(orgId);
                if (orgId) {
                  // Find document where loginUserId contains <orgId>_ADMIN
                  const adminUser = await LoginUsers.findOne({ loginUserId: new RegExp(`${orgId}_ADMIN`) });
                  if (adminUser) {
                      adminId = adminUser.loginUserId;
                  }
              }
        }

        // Generate JWT, including AdminId if applicable
        const token = jwt.sign(
            { 
                id: user.loginUserId, 
                role: user.role, 
                email: user.email, 
                AdminId: adminId // Only set if found; null otherwise
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: 'Sign-in successful', token });
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



export default router; 
