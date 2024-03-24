/*
routes/retailer/
retailer role for users
*/

const express = require("express");
const router = express.Router();
const Retailer = require("../models/retailer");
const Product = require("../models/Product");
const User = require("../models/user"); // Assuming this is where the User model is defined
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper function to validate a token and authenticate a user
const validateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(403).json({ status: "error", error: "User does not exist" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ status: "error", error: "Invalid Token" });
    }
};

// Helper function to check if the authenticated user is a retailer
const isRetailer = (req, res, next) => {
    // Check if the role of the user is "retailer"
    // This assumes that the user's role is stored in the 'role' field
    if (req.user.role === 'retailer') {
        next();
    } else {
        res.status(403).send("Access denied: User is not a retailer.");
    }
};

// Retailer registration endpoint - similar to user registration
// POST /register - Register a new retailer
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, storeName } = req.body;

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new User with the role 'retailer'
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'retailer' // Ensure that the User model has a 'role' field
        });

        // Create a new Retailer linked to the User
        const retailer = await Retailer.create({
            user: user._id, // Link to the User ID
            storeName: storeName
        });

        // Respond with success
        res.status(201).json({
            userId: user._id,
            retailerId: retailer._id,
            storeName: retailer.storeName
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// POST /login - Log in a retailer
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Look up the user by email
        const user = await User.findOne({ email: email });

        // If the user doesn't exist or the role is not 'retailer', return an error
        if (!user || user.role !== 'retailer') {
            return res.status(401).json({ status: "error", error: "Invalid Login" });
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // Generate a JWT token
            const token = jwt.sign(
                { email: user.email, role: user.role },
                "secret123" // Use a strong secret in production, preferably from an environment variable
            );

            // Respond with the JWT token
            res.json({ status: "Ok", token: token });
        } else {
            res.status(401).json({ status: "error", error: "Invalid Login" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// GET /my-products - Get all products for the log      ged-in retailer
router.get("/my-products", validateToken, isRetailer, async (req, res) => {
    try {
        // Retrieve all products that have the retailer field set to the logged-in user's ID
        const products = await Product.find({ retailer: req.user._id });

        // Respond with the list of products
        res.json(products);
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ message: error.message });
    }
});


 // Assuming the token validation and retailer role check are defined above this route
router.post("/add-product", validateToken, isRetailer, async (req, res) => {
    try {

        const { name, price, description} = req.body;
        
        // Check if the logged-in user is a retailer
        if (req.user.role !== 'retailer') {
            return res.status(403).send('Error: Only retailers can add products.');
        }

        // Assuming that the retailer ID is stored in the user model when they are registered as a retailer
        const retailerId = req.user.retailerId; 

        // Create a new product instance
        const newProduct = new Product({
            name,
            price,
            description,
            retailer: req.user._id, 
        });

        // Save the new product to the database
        await newProduct.save();

        // Respond with the newly created product
        res.status(201).json(newProduct);
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ message: error.message });
    }
});

router.put("/update-product/:productId", validateToken, isRetailer, async (req, res) => {
    const { productId } = req.params;
    const { name, price, description} = req.body;

    try {
        const product = await Product.findOne({ _id: productId, retailer: req.user._id });
        
        if (!product) {
            return res.status(404).send('Product not found or you do not have permission to update it.');
        }

        // Update product details
        if (name) product.name = name;
        if (price) product.price = price;
        if (description) product.description = description;
        
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /delete-product/:productId - Delete a product
router.delete("/delete-product/:productId", validateToken, isRetailer, async (req, res) => {
    const { productId } = req.params;

    try {
        // First, ensure the product belongs to the retailer
        const product = await Product.findOne({ _id: productId, retailer: req.user._id });
        if (!product) {
            return res.status(404).send('Product not found or you do not have permission to delete it.');
        }

        // Use findByIdAndDelete to remove the product
        await Product.findByIdAndDelete(productId);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;
