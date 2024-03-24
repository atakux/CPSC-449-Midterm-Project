const express = require("express");
const router = express.Router();
const User = require("../models/user");
const config = require('../config');


const basicAuth = (req, res, next) => {
    // Extract credentials from 'Authorization' header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // No or invalid 'Authorization' header, unauthenticated request
      res.status(401).send('Unauthorized');
      return;
    }
  
    // Decode base64 encoded credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
  
    // Check if credentials match config.js
    if (username === config.adminUsername && password === config.adminPassword) {
      // Authenticated, proceed to the next middleware
      next();
    } else {
      // Invalid credentials, unauthorized request
      res.status(401).send('Unauthorized');
    }
  };



// DELETE route to delete a user by ID with basic authentication
router.delete('/', basicAuth, async (req, res) => {
    const userId = req.body.id; // Extract user ID from request body

    try {
        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(userId);
        
        // If user not found, return 404
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Respond with success message
        res.json({ message: 'User deleted', deletedUser });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
    }
});




module.exports = router;
