//routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/Product");
const config = require('../config');
const bcrypt = require("bcrypt");


// Basic authentication middleware
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
router.delete('/deleteUser', basicAuth, async (req, res) => {
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





// PATCH route to update a user's username, email, and password
router.patch('/updateUser', basicAuth, async (req, res) => {
    const { id, name, email, password } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(id);

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Update user data
        user.name = name;
        user.email = email;
        user.password = encryptedPassword; // Make sure to hash the password before saving in a real application

        // Save the updated user
        const updatedUser = await user.save();

        // Respond with success message and updated user data
        res.json({ message: 'User updated', updatedUser });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
    }
});



// DELETE route to delete a product by ID with basic authentication
router.delete('/deleteProduct', basicAuth, async (req, res) => {
    const productId = req.body.id; // Extract product ID from request body

    try {
        // Find and delete the product by ID
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        // If product not found, return 404
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Respond with success message
        res.json({ message: 'Product deleted', deletedProduct });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
    }
});





// PATCH route to update a product's name, price, and description
router.patch('/updateProduct', basicAuth, async (req, res) => {
    const { id, name, price, description} = req.body;

    try {
        // Find the user by ID
        const product = await Product.findById(id);

        // If user not found, return 404
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product data
        product.name = name;
        product.price = price;
        product.description = description;

        // Save the updated product
        const updatedProduct = await product.save();

        // Respond with success message and updated user data
        res.json({ message: 'Product updated', updatedProduct });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
    }
});





module.exports = router;