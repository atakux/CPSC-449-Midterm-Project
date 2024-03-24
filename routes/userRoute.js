/*
routes/userRoute.js
This module provides basic CRUD operations for the user/customer role.
These include operations on the user account and associated shopping cart.

Defined routes:
    POST /register - register new user
    POST /login - log user in and return authentication token
    PATCH /pass - update user password
    GET /cart - return user cart
    POST /cart - add one product to cart
    DELETE /cart - delete one item from cart
    DELETE / - delete user account
*/

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/Product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Adds a new user to the database
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role = 'customer' } = req.body; // Default role is 'customer'
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role// Store the role in the user document
        });

        res.status(201).json({ message: "User registered successfully", userId: newUser._id, role: newUser.role });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error code
            res.status(400).json({ status: "error", error: "Email already in use" });
        } else {
            res.status(500).json({ status: "error", error: error.message });
        }
    }
});

// Returns an authentication token to the user after login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: "error", error: "Invalid login credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", error: "Invalid login credentials" });
        }

        const token = jwt.sign({
            userId: user._id,
            role: user.role // Include role in the token
        }, "secret123");

        res.json({ status: "Ok", token, role: user.role });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// Update user password
router.patch("/pass", validateToken, async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10);

        const user = await User.findByIdAndUpdate(
            res.locals.user._id.toString(),
            { password: newPassword },
            { new: true }
        );

        if (!user) {
            return res.json({ status: "error", error: "User Does Not Exist" });
        }

        res.status(200).send("Password updated");
    } catch (error) {
        res.status(500).send(error);
    }
});

// Returns content of a user's cart 
//Uses the id stored in the cart to find the full descriptions
//If any objects in the cart are no longer available, will notify the customer 
router.get("/cart", validateToken, async (req, res) => {

    //store cart in new array to make it easier
    const carts = res.locals.user.cart;

    const cartResults = [];

    //these are just counters for the loops"
    validProducts = 0;
    invalidProducts = 0;

    //loops over the IDs, then returns full descriptions and updates counters
    for(item in carts){
        const product = await Product.findOne({_id: carts[item],});
        if(!product){
            invalidProducts++;
        }            
        else{
            cartResults[validProducts] = product;
            validProducts++;
        }

    }
    cartResults[validProducts] = "Products that are no longer available in the cart: " + invalidProducts;
    res.status(200).send(cartResults);
});

// Adds a product to a user's cart in the form of the product's database id
router.post("/cart", validateToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.body.product,
        });

        if (!product) {
            return res.json({ status: "error", error: "Not a product" });
        }

        await User.updateOne(
            { email: res.locals.user.email },
            { $push: { cart: req.body.product } }
        );

        return res.json({ status: "Ok" });
    } catch (error) {
        return res.json({ status: "error", error: "Not a user" });
    }
});

// Removes one product from a user's cart
router.delete("/cart", validateToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.body.product,
        });

        if (!product) {
            return res.json({ status: "error", error: "Not a product" });
        }

        const user = res.locals.user;

        // Ensures only one product is deleted (in event of duplicates in cart)
        const index = user.cart.indexOf(req.body.product);
        if (index !== -1) {
            user.cart.splice(index, 1);
            await user.save();
        }

        return res.json({ status: "Ok" });
    } catch (error) {
        return res.json({ status: "error", error: "Not a user" });
    }
});

// Delete user account
router.delete("/", validateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(
            res.locals.user._id.toString()
        );

        if (!user) {
            return res.json({ status: "error", error: "User Does Not Exist" });
        }

        res.status(200).send("Account Deleted");
    } catch (error) {
        res.status(500).send(error);
    }
});

// Middleware for validating a request's authentication token
async function validateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader;

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");

        const user = await User.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.json({ status: "error", error: "User Does Not Exist" });
        }

        res.locals.user = user; // For passing user to next function
    } catch (error) {
        return res.json({ status: "error", error: "Invalid Token" });
    }

    next();
}

module.exports = router;
