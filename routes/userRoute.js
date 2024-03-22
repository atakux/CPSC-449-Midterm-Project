const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Product = require("../model/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        return res.json({ status: "error", user: false });
    }
});

router.get("/cart", validateToken, async (req, res) => {
    res.status(200).send(res.locals.user.cart);
});

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

router.delete("/cart", validateToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.body.product,
        });

        if (!product) {
            return res.json({ status: "error", error: "Not a product" });
        }

        const user = res.locals.user;

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

router.delete("/", validateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(res.locals.user._id.toString());
        res.status(200).send("Account Deleted");
    } catch (error) {
        res.status(500).send(error);
    }
});

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

        res.locals.user = user;
    } catch (error) {
        return res.json({ status: "error", error: "Invalid Token" });
    }

    next();
}

module.exports = router;
