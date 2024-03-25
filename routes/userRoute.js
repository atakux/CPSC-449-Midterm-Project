/*
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
        const newPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
        });

        res.status(200).send("User Added to the Database");
    } catch (err) {
        res.json({ staus: "error", error: "Duplicate email" });
    }
});

// Returns an authentication token to the user after login
router.post("/login", async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return res.json({ status: "error", error: "Invalid Login" });
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            "secret123"
        );

        return res.json({ status: "Ok", user: token });
    } else {
        return res.json({ status: "error", user: "Wrong password" });
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
    productsCounter = 0;
    invalidCounter = 0;

    //loops over the IDs, then returns full descriptions and updates counters
    for(item in carts){
        const product = await Product.findOne({_id: carts[item],});
        if(!product){
            invalidCounter++;
            cartResults[productsCounter] = "No longer available: " + carts[productsCounter];
            productsCounter++;
        }            
        else{
            cartResults[productsCounter] = product;
            productsCounter++;
        }


    }
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
